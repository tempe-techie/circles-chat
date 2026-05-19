# Intermediate Embedded Mini App Guide

This guide is takes building Embedded Mini Apps one step further and we are going to demonstrate it with a practical example mini app linked below.

{% embed url="<https://github.com/aboutcircles/intermediate-miniapp-tutorial>" %}

Compared to simple embedded mini apps, where the user signs a transaction and an action happens directly, in this example the app performs a couple of extra backend steps (which you can vary based upon your mini app's logic).\
An intermediate mini app lets the host wallet execute the payment, embed a signed payment intent into the transfer, match it later through the Circles RPC, then issue a signed receipt or sign on chain transfers.

{% hint style="info" %}
You can also setup Circles Org using this [mini app](https://circles.gnosis.io/admin/miniapps-org-manager) if you want to process CRC payments from your backend. For example, a game which rewards people in CRC for winning , can setup an Org using that miniapp, fund it, add an eoa as a signer and confgure direct payments in the backend.
{% endhint %}

***

### Get Started

Clone the repository:

```
git clone https://github.com/aboutcircles/intermediate-miniapp-tutorial
cd intermediate-miniapp-tutorial
```

Install Dependencies & Start the dev server:

```
pnpm install
pnpm dev
```

Navigate to <https://circles.gnosis.io/playground> and paste your localhost dev url.

### Architecture

The app has four parts:

```
Circles Host
  └─ MiniApp iframe
       └─ React UI + MiniApp SDK

MiniApp Backend
  ├─ Builds CRC payment calldata
  ├─ HMAC-signs payment intents
  ├─ Matches transfers through the Circles indexer
  └─ Signs EIP-712 ticket receipts

Circles RPC / Indexer
  └─ Exposes indexed transfer events

User Wallet
  └─ Safe + ERC-4337 via the host
```

The key principle is simple:

The frontend is not trusted.

It can ask the backend to build transactions. It can ask the host to submit them. But it never verifies payments, signs receipts, or holds secrets.

***

### Handling Wallets Through the MiniApp SDK

Inside the Circles host, the MiniApp does not connect to a wallet directly.

Instead, it uses [`@aboutcircles/miniapp-sdk`](https://www.npmjs.com/package/@aboutcircles/miniapp-sdk):

```ts
import {
  isMiniappMode,
  onWalletChange,
  sendTransactions,
  signMessage,
} from "@aboutcircles/miniapp-sdk";
```

The app first checks whether it is running inside the host:

```ts
const isEmbedded =
  typeof window === "undefined" ? false : isMiniappMode();
```

Then it subscribes to wallet updates:

```ts
onWalletChange((address) => {
  setWalletAddress(address ?? null);
});
```

This keeps the MiniApp reactive without owning the wallet session.

The most important primitive is `sendTransactions()`:

```ts
await sendTransactions([
  {
    to: tx.to,
    data: tx.data,
    value: tx.value,
  },
]);
```

This opens the host-controlled approval flow. The user approves through the host wallet, and the host submits the transaction through ERC-4337.

One important detail: `sendTransactions()` does not mean the payment has landed on-chain. It usually gives you a UserOperation submission result, not a normal transaction hash you can immediately match against a transfer.

So the MiniApp treats transaction submission as only the beginning of the verification flow.

***

### Building a Payment Intent&#x20;

When the user clicks “Buy ticket,” the frontend calls the backend:

```
POST /api/build-payment
```

The backend creates a signed payment intent:

```ts
type PaymentPayload = {
  v: 1;
  e: string;              // eventId
  t: string;              // ticketTypeId
  b: `0x${string}`;        // buyer address
  x: number;              // expiry timestamp
  n: string;              // random nonce
};
```

It serializes that payload and signs it with HMAC:

```
crc-ticket.<base64url(payload)>.<hmac>
```

This token is the payment intent.

It answers:

Who is buying what, for which event, before what expiry, with which unique nonce?

Because the backend can verify the HMAC later, it does not need to store this intent in a database.

***

### Embedding the Intent Into the CRC Transfer

The backend then builds the CRC transfer calldata.

The important trick is that the signed payment intent is embedded into the transfer metadata:

```ts
const txs = await builder.constructAdvancedTransfer(
  buyerAddress,
  organizerAddress,
  amount,
  {
    txData: paymentDataToBytes(paymentData),
  },
);
```

The backend returns these transactions to the frontend:

```ts
return txs.map((tx) => ({
  to: tx.to,
  data: tx.data,
  value: tx.value.toString(),
}));
```

Notice the `value.toString()`.

Transaction objects cross a JSON boundary, so BigInts must become strings.

The frontend then passes these transactions to the host:

```ts
await sendTransactions(txs);
```

At this point:

1. the host asks the user to approve,
2. the wallet submits the transaction,
3. the CRC transfer eventually lands on-chain,
4. the Circles indexer eventually sees the transfer metadata.

***

### Matching the Transaction Later

After submission, the frontend navigates to a ticket page:

```
/ticket/<paymentData>
```

That page polls:

```
POST /api/issue-receipt
```

The backend receives the `paymentData`, verifies the HMAC, and then searches the Circles indexer for a matching transfer.

The match is based on:

* recipient equals the organizer address
* embedded metadata contains the same `crc-ticket...` token
* token HMAC is valid
* token buyer/event/ticket fields are valid

Simplified flow:

```
paymentData from URL
        │
        ▼
verify HMAC
        │
        ▼
query Circles transfer events
        │
        ▼
find transfer containing same paymentData
        │
        ▼
issue receipt
```

This is the core database-less trick.

The on-chain transfer carries the intent, and the backend later confirms that the intent actually landed.

***

### &#x20;Handling Eventual Consistency

The app does not assume instant confirmation.

The receipt endpoint returns one of three states:

```ts
{ status: "pending" }
```

```ts
{ status: "ready", signedTicket }
```

```ts
{ status: "expired" }
```

The frontend polls with backoff.

This is important because there are multiple async layers:

```
host approval
  → ERC-4337 submission
  → inclusion
  → indexing
  → backend verification
```

A successful `sendTransactions()` call only proves that the transaction request was submitted. It does not prove that payment was indexed.

***

### Signing the Ticket Receipt

Once the backend finds the matching transfer, it signs a ticket receipt using EIP-712.

The receipt looks like this:

```ts
type TicketReceipt = {
  ticketId: string;
  eventId: string;
  ticketTypeId: string;
  buyerAddress: `0x${string}`;
  recipientAddress: `0x${string}`;
  amountCrc: string;
  paymentData: string;
  issuedAt: string;
  expiresAt: string;
};
```

The backend signs it with a dedicated App Operator EOA:

```ts
const signature = await operator.signTypedData({
  domain,
  types,
  primaryType: "TicketReceipt",
  message,
});
```

This signed receipt becomes the actual ticket.

The user can store it, show it as a QR code, or present it to a scanner.

***

### Why Use a Separate Operator Key?

The App Operator key only signs receipts.

It does not:

* hold CRC
* receive payments
* send transactions
* control organizer funds

The organizer address receives the actual payment. The operator key only attests:

“This payment was verified, and this ticket is valid.”

But you can also add a transactional backend, which for example maybe processes payouts, etc.

***

### QR Code as Portable Proof

When the ticket is ready, the frontend encodes the signed receipt:

```ts
base64url(JSON.stringify(signedTicket))
```

That encoded payload becomes the QR code.

A scanner can verify the ticket offline by checking the EIP-712 signature against the operator address.

No backend call is required at the door.

That makes the ticket portable:

```
signed receipt + operator public address = verifiable ticket
```

***

### Ideal User Journey (Example)

```
User clicks Buy
      │
      ▼
Frontend calls /api/build-payment
      │
      ▼
Backend creates HMAC-signed paymentData
      │
      ▼
Backend embeds paymentData into CRC transfer txData
      │
      ▼
Frontend calls sendTransactions()
      │
      ▼
Host wallet submits the transaction
      │
      ▼
Frontend opens /ticket/<paymentData>
      │
      ▼
Frontend polls /api/issue-receipt
      │
      ▼
Backend finds matching transfer in Circles indexer
      │
      ▼
Backend signs EIP-712 ticket receipt
      │
      ▼
Frontend renders QR ticket
```

***

For CRC Tickets, the payment is the on-chain action. The ticket is an off-chain signed receipt. The bridge between them is the signed payment intent embedded inside the transfer.


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.aboutcircles.com/miniapps/embedded-mini-apps/intermediate-embedded-mini-app-guide.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
