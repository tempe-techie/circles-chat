# Circles API

## POST /circlesV2\_getTotalBalance

> Get v2 Circles total balance of an address

```json
{"openapi":"3.0.3","info":{"title":"Circles JSON-RPC API (V2)","version":"1.0.0"},"servers":[{"url":"https://rpc.aboutcircles.com/","description":"Production endpoint"}],"paths":{"/circlesV2_getTotalBalance":{"post":{"summary":"Get v2 Circles total balance of an address","operationId":"circlesV2_getTotalBalance","requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcRequest"},{"properties":{"method":{"type":"string","enum":["circlesV2_getTotalBalance"]},"params":{"type":"array","minItems":1,"maxItems":2,"items":{"oneOf":[{"$ref":"#/components/schemas/Address"},{"type":"boolean","description":"asTimeCircles (optional)"}]}}}}]}}}},"responses":{"200":{"description":"Balance string (decimal or integer depending on asTimeCircles).","content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcSuccess"},{"properties":{"result":{"$ref":"#/components/schemas/NumericString"}}}]}}}}}}}},"components":{"schemas":{"JsonRpcRequest":{"type":"object","required":["jsonrpc","method","id","params"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"method":{"type":"string"},"id":{"type":"integer"},"params":{"type":"array","description":"Ordered parameters."}}},"Address":{"type":"string","pattern":"^0x[a-fA-F0-9]{40}$","description":"Ethereum 20-byte address."},"JsonRpcSuccess":{"type":"object","required":["jsonrpc","id","result"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"id":{"type":"integer"},"result":{"description":"Method-specific payload."}}},"NumericString":{"type":"string","description":"String-encoded integer or decimal numeric value."}}}}
```

## POST /circles\_getTokenBalances

> Get all Circles v2 token balances held by an address

```json
{"openapi":"3.0.3","info":{"title":"Circles JSON-RPC API (V2)","version":"1.0.0"},"servers":[{"url":"https://rpc.aboutcircles.com/","description":"Production endpoint"}],"paths":{"/circles_getTokenBalances":{"post":{"summary":"Get all Circles v2 token balances held by an address","operationId":"circles_getTokenBalances","requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcRequest"},{"properties":{"method":{"type":"string","enum":["circles_getTokenBalances"]},"params":{"type":"array","minItems":1,"maxItems":1,"items":{"$ref":"#/components/schemas/Address"}}}}]}}}},"responses":{"200":{"description":"Array of token balances.","content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcSuccess"},{"properties":{"result":{"type":"array","items":{"$ref":"#/components/schemas/CirclesTokenBalance"}}}}]}}}}}}}},"components":{"schemas":{"JsonRpcRequest":{"type":"object","required":["jsonrpc","method","id","params"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"method":{"type":"string"},"id":{"type":"integer"},"params":{"type":"array","description":"Ordered parameters."}}},"Address":{"type":"string","pattern":"^0x[a-fA-F0-9]{40}$","description":"Ethereum 20-byte address."},"JsonRpcSuccess":{"type":"object","required":["jsonrpc","id","result"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"id":{"type":"integer"},"result":{"description":"Method-specific payload."}}},"CirclesTokenBalance":{"type":"object","required":["TokenAddress","TokenId","TokenOwner","TokenType","Version","AttoCircles","Circles","StaticAttoCircles","StaticCircles","AttoCrc","Crc","IsErc20","IsErc1155","IsWrapped","IsInflationary","IsGroup"],"properties":{"TokenAddress":{"$ref":"#/components/schemas/Address"},"TokenId":{"type":"string","description":"Token address or token id string."},"TokenOwner":{"$ref":"#/components/schemas/Address"},"TokenType":{"type":"string","enum":["CrcV2_RegisterHuman","CrcV2_RegisterGroup","CrcV2_RegisterOrganization","CrcV2_ERC20WrapperDeployed_Demurraged","CrcV2_ERC20WrapperDeployed_Inflationary"]},"Version":{"type":"integer","enum":[2]},"AttoCircles":{"$ref":"#/components/schemas/BigIntString"},"Circles":{"type":"number"},"StaticAttoCircles":{"$ref":"#/components/schemas/BigIntString"},"StaticCircles":{"type":"number"},"AttoCrc":{"$ref":"#/components/schemas/BigIntString"},"Crc":{"type":"number"},"IsErc20":{"type":"boolean"},"IsErc1155":{"type":"boolean"},"IsWrapped":{"type":"boolean"},"IsInflationary":{"type":"boolean"},"IsGroup":{"type":"boolean"}}},"BigIntString":{"type":"string","description":"Decimal-encoded arbitrary-precision integer."}}}}
```

## POST /circles\_getCommonTrust

> Get common trust between two addresses (v2)

```json
{"openapi":"3.0.3","info":{"title":"Circles JSON-RPC API (V2)","version":"1.0.0"},"servers":[{"url":"https://rpc.aboutcircles.com/","description":"Production endpoint"}],"paths":{"/circles_getCommonTrust":{"post":{"summary":"Get common trust between two addresses (v2)","operationId":"circles_getCommonTrust","requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcRequest"},{"properties":{"method":{"type":"string","enum":["circles_getCommonTrust"]},"params":{"type":"array","minItems":2,"maxItems":3,"items":{"oneOf":[{"$ref":"#/components/schemas/Address"},{"type":"integer","enum":[2],"description":"Version filter (optional, v2 only)."}]}}}}]}}}},"responses":{"200":{"description":"Array of common trusted addresses.","content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcSuccess"},{"properties":{"result":{"type":"array","items":{"$ref":"#/components/schemas/Address"}}}}]}}}}}}}},"components":{"schemas":{"JsonRpcRequest":{"type":"object","required":["jsonrpc","method","id","params"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"method":{"type":"string"},"id":{"type":"integer"},"params":{"type":"array","description":"Ordered parameters."}}},"Address":{"type":"string","pattern":"^0x[a-fA-F0-9]{40}$","description":"Ethereum 20-byte address."},"JsonRpcSuccess":{"type":"object","required":["jsonrpc","id","result"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"id":{"type":"integer"},"result":{"description":"Method-specific payload."}}}}}}
```

## POST /circlesV2\_findPath

> Path-finding with target flow (Circles v2)

```json
{"openapi":"3.0.3","info":{"title":"Circles JSON-RPC API (V2)","version":"1.0.0"},"servers":[{"url":"https://rpc.aboutcircles.com/","description":"Production endpoint"}],"paths":{"/circlesV2_findPath":{"post":{"summary":"Path-finding with target flow (Circles v2)","operationId":"circlesV2_findPath","requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcRequest"},{"properties":{"method":{"type":"string","enum":["circlesV2_findPath"]},"params":{"type":"array","minItems":1,"maxItems":1,"items":{"$ref":"#/components/schemas/FlowRequest"}}}}]}}}},"responses":{"200":{"description":"Path with flow allocations.","content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcSuccess"},{"properties":{"result":{"$ref":"#/components/schemas/MaxFlowResponse"}}}]}}}}}}}},"components":{"schemas":{"JsonRpcRequest":{"type":"object","required":["jsonrpc","method","id","params"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"method":{"type":"string"},"id":{"type":"integer"},"params":{"type":"array","description":"Ordered parameters."}}},"FlowRequest":{"type":"object","required":["Source","Sink","TargetFlow"],"properties":{"Source":{"$ref":"#/components/schemas/Address"},"Sink":{"$ref":"#/components/schemas/Address"},"TargetFlow":{"$ref":"#/components/schemas/BigIntString"},"ToTokens":{"type":"array","items":{"$ref":"#/components/schemas/Address"}},"FromTokens":{"type":"array","items":{"$ref":"#/components/schemas/Address"}},"ExcludedFromTokens":{"type":"array","items":{"$ref":"#/components/schemas/Address"}},"ExcludedToTokens":{"type":"array","items":{"$ref":"#/components/schemas/Address"}},"WithWrap":{"type":"boolean"},"SimulatedBalances":{"type":"array","items":{"$ref":"#/components/schemas/SimulatedBalance"}},"SimulatedTrusts":{"type":"array","items":{"$ref":"#/components/schemas/SimulatedTrust"}}}},"Address":{"type":"string","pattern":"^0x[a-fA-F0-9]{40}$","description":"Ethereum 20-byte address."},"BigIntString":{"type":"string","description":"Decimal-encoded arbitrary-precision integer."},"SimulatedBalance":{"type":"object","required":["Holder","Token","Amount"],"properties":{"Holder":{"$ref":"#/components/schemas/Address"},"Token":{"$ref":"#/components/schemas/Address"},"Amount":{"$ref":"#/components/schemas/BigIntString"},"IsWrapped":{"type":"boolean","nullable":true},"IsStatic":{"type":"boolean","nullable":true}}},"SimulatedTrust":{"type":"object","required":["Truster","Trustee"],"properties":{"Truster":{"$ref":"#/components/schemas/Address"},"Trustee":{"$ref":"#/components/schemas/Address"}}},"JsonRpcSuccess":{"type":"object","required":["jsonrpc","id","result"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"id":{"type":"integer"},"result":{"description":"Method-specific payload."}}},"MaxFlowResponse":{"type":"object","required":["MaxFlow","Transfers"],"properties":{"MaxFlow":{"$ref":"#/components/schemas/BigIntString"},"Transfers":{"type":"array","items":{"$ref":"#/components/schemas/TransferPathStep"}}}},"TransferPathStep":{"type":"object","required":["From","To","TokenOwner","Value"],"properties":{"From":{"$ref":"#/components/schemas/Address"},"To":{"$ref":"#/components/schemas/Address"},"TokenOwner":{"$ref":"#/components/schemas/Address"},"Value":{"$ref":"#/components/schemas/BigIntString"}}}}}}
```

## SQL-like indexed query

> Perform a SQL-like query on the indexed data.\
> \
> Useful query templates (YAML)\
> \
> \### Recent v2 avatar registrations\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "Avatars"\
> &#x20;   Columns:\
> &#x20;     \- "blockNumber"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "transactionHash"\
> &#x20;     \- "type"\
> &#x20;     \- "avatar"\
> &#x20;     \- "tokenId"\
> &#x20;     \- "name"\
> &#x20;     \- "cidV0Digest"\
> &#x20;   Filter:\
> &#x20;     \[]\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "blockNumber"\
> &#x20;       SortOrder: "DESC"\
> &#x20;     -\
> &#x20;       Column: "transactionIndex"\
> &#x20;       SortOrder: "DESC"\
> &#x20;     -\
> &#x20;       Column: "logIndex"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 25\
> \`\`\`\
> \
> \### Incoming + outgoing trust relations for an address\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "TrustRelations"\
> &#x20;   Columns:\
> &#x20;     \- "blockNumber"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "truster"\
> &#x20;     \- "trustee"\
> &#x20;     \- "expiryTime"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "Conjunction"\
> &#x20;       ConjunctionType: "Or"\
> &#x20;       Predicates:\
> &#x20;         -\
> &#x20;           Type: "FilterPredicate"\
> &#x20;           FilterType: "Equals"\
> &#x20;           Column: "truster"\
> &#x20;           Value: "0xae3a29a9ff24d0e936a5579bae5c4179c4dff565"\
> &#x20;         -\
> &#x20;           Type: "FilterPredicate"\
> &#x20;           FilterType: "Equals"\
> &#x20;           Column: "trustee"\
> &#x20;           Value: "0xae3a29a9ff24d0e936a5579bae5c4179c4dff565"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "blockNumber"\
> &#x20;       SortOrder: "DESC"\
> &#x20;     -\
> &#x20;       Column: "logIndex"\
> &#x20;       SortOrder: "DESC"\
> \`\`\`\
> \
> \### Balances for one account, ordered by demurraged balance\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "BalancesByAccountAndToken"\
> &#x20;   Columns:\
> &#x20;     \- "account"\
> &#x20;     \- "tokenAddress"\
> &#x20;     \- "tokenId"\
> &#x20;     \- "lastActivity"\
> &#x20;     \- "totalBalance"\
> &#x20;     \- "demurragedTotalBalance"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "account"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "demurragedTotalBalance"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 50\
> \`\`\`\
> \
> \### Group overview with membership counts\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "Groups"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "name"\
> &#x20;     \- "symbol"\
> &#x20;     \- "memberCount"\
> &#x20;     \- "owner"\
> &#x20;     \- "mintPolicy"\
> &#x20;     \- "treasury"\
> &#x20;     \- "erc20WrapperDemurraged"\
> &#x20;     \- "erc20WrapperStatic"\
> &#x20;   Filter:\
> &#x20;     \[]\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "memberCount"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 20\
> \`\`\`\
> \
> \### Members of a group (v2)\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupMemberships"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "member"\
> &#x20;     \- "memberType"\
> &#x20;     \- "expiryTime"\
> &#x20;     \- "timestamp"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> \`\`\`\
> \
> \### Recent transfers involving an address\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "Transfers"\
> &#x20;   Columns:\
> &#x20;     \- "blockNumber"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "transactionHash"\
> &#x20;     \- "from"\
> &#x20;     \- "to"\
> &#x20;     \- "id"\
> &#x20;     \- "value"\
> &#x20;     \- "type"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "Conjunction"\
> &#x20;       ConjunctionType: "Or"\
> &#x20;       Predicates:\
> &#x20;         -\
> &#x20;           Type: "FilterPredicate"\
> &#x20;           FilterType: "Equals"\
> &#x20;           Column: "from"\
> &#x20;           Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;         -\
> &#x20;           Type: "FilterPredicate"\
> &#x20;           FilterType: "Equals"\
> &#x20;           Column: "to"\
> &#x20;           Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "blockNumber"\
> &#x20;       SortOrder: "DESC"\
> &#x20;     -\
> &#x20;       Column: "transactionIndex"\
> &#x20;       SortOrder: "DESC"\
> &#x20;     -\
> &#x20;       Column: "logIndex"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 100\
> \`\`\`\
> \
> \### Total supply for a specific token\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "TotalSupply"\
> &#x20;   Columns:\
> &#x20;     \- "tokenAddress"\
> &#x20;     \- "tokenId"\
> &#x20;     \- "totalSupply"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "tokenAddress"\
> &#x20;       Value: "0x42cedde51198d1773590311e2a340dc06b24cb37"\
> &#x20;   Order:\
> &#x20;     \[]\
> \`\`\`\
> \
> \### Holders of a group token with ownership fraction\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupTokenHoldersBalance"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "holder"\
> &#x20;     \- "demurragedTotalBalance"\
> &#x20;     \- "fractionOwnership"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "demurragedTotalBalance"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 50\
> \`\`\`\
> \
> \### Group token supply (demurraged)\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupTokenSupply"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "totalSupply"\
> &#x20;     \- "demurragedTotalSupply"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     \[]\
> \`\`\`\
> \
> \### Group collateral locked by token\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupCollateralByToken"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "id"\
> &#x20;     \- "amountLocked"\
> &#x20;     \- "demurragedAmountLocked"\
> &#x20;     \- "fractionLocked"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "amountLocked"\
> &#x20;       SortOrder: "DESC"\
> \`\`\`\
> \
> \### Group vault balances by token\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupVaultBalancesByToken"\
> &#x20;   Columns:\
> &#x20;     \- "vault"\
> &#x20;     \- "id"\
> &#x20;     \- "balance"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "vault"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "balance"\
> &#x20;       SortOrder: "DESC"\
> \`\`\`\
> \
> \### Daily group member counts\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupMembersCount\_1d"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "value"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 30\
> \`\`\`\
> \
> \### Daily wrap/unwrap activity for a group token\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupWrapUnWrap\_1d"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "tokenAddress"\
> &#x20;     \- "tokenType"\
> &#x20;     \- "wrapAmount"\
> &#x20;     \- "unwrapAmount"\
> &#x20;     \- "wrapSupply"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 30\
> \`\`\`\
> \
> \### Daily mint/redeem activity for a group token\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupMintRedeem\_1d"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "minted"\
> &#x20;     \- "burned"\
> &#x20;     \- "supply"\
> &#x20;     \- "demurragedMinted"\
> &#x20;     \- "demurragedBurned"\
> &#x20;     \- "demurragedSupply"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 30\
> \`\`\`\
> \
> \### Daily affiliate members count\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "AffiliateMembersCount\_1d"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "value"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 30\
> \`\`\`\
> \
> \### Daily Balancer vault balance for an ERC20 wrapper\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "Erc20BalancerVaultBalance\_1d"\
> &#x20;   Columns:\
> &#x20;     \- "timestamp"\
> &#x20;     \- "tokenAddress"\
> &#x20;     \- "value"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "tokenAddress"\
> &#x20;       Value: "0x42cedde51198d1773590311e2a340dc06b24cb37"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 30\
> \`\`\`\
> \
> \### LBP circles backing deployments\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "CrcV2"\
> &#x20;   Table: "CirclesBackingDeployed"\
> &#x20;   Columns:\
> &#x20;     \- "blockNumber"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "transactionHash"\
> &#x20;     \- "emitter"\
> &#x20;     \- "backer"\
> &#x20;     \- "circlesBackingInstance"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "backer"\
> &#x20;       Value: "0xeced91232c609a42f6016860e8223b8aecaa7bd0"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "blockNumber"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 100\
> \`\`\`\
> \
> \### Group collateral delta by token\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupCollateralDiffByToken"\
> &#x20;   Columns:\
> &#x20;     \- "timestamp"\
> &#x20;     \- "group"\
> &#x20;     \- "id"\
> &#x20;     \- "amountLocked"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 100\
> \`\`\`\
> \
> \### Hourly group member counts\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupMembersCount\_1h"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "value"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 72\
> \`\`\`\
> \
> \### Hourly wrap/unwrap activity for a group token\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupWrapUnWrap\_1h"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "tokenAddress"\
> &#x20;     \- "tokenType"\
> &#x20;     \- "wrapAmount"\
> &#x20;     \- "unwrapAmount"\
> &#x20;     \- "wrapSupply"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 72\
> \`\`\`\
> \
> \### Hourly mint/redeem activity for a group token\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "GroupMintRedeem\_1h"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "minted"\
> &#x20;     \- "burned"\
> &#x20;     \- "supply"\
> &#x20;     \- "demurragedMinted"\
> &#x20;     \- "demurragedBurned"\
> &#x20;     \- "demurragedSupply"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 72\
> \`\`\`\
> \
> \### Hourly affiliate members count\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "AffiliateMembersCount\_1h"\
> &#x20;   Columns:\
> &#x20;     \- "group"\
> &#x20;     \- "timestamp"\
> &#x20;     \- "value"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "group"\
> &#x20;       Value: "0xde374ece6fa50e781e81aac78e811b33d16912c7"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 72\
> \`\`\`\
> \
> \### Hourly Balancer vault balance for an ERC20 wrapper\
> \
> \`\`\`yaml\
> jsonrpc: "2.0"\
> id: 1\
> method: "circles\_query"\
> params:\
> &#x20; -\
> &#x20;   Namespace: "V\_CrcV2"\
> &#x20;   Table: "Erc20BalancerVaultBalance\_1h"\
> &#x20;   Columns:\
> &#x20;     \- "timestamp"\
> &#x20;     \- "tokenAddress"\
> &#x20;     \- "value"\
> &#x20;   Filter:\
> &#x20;     -\
> &#x20;       Type: "FilterPredicate"\
> &#x20;       FilterType: "Equals"\
> &#x20;       Column: "tokenAddress"\
> &#x20;       Value: "0x42cedde51198d1773590311e2a340dc06b24cb37"\
> &#x20;   Order:\
> &#x20;     -\
> &#x20;       Column: "timestamp"\
> &#x20;       SortOrder: "DESC"\
> &#x20;   Limit: 72\
> \`\`\`\
> \ <br>

````json
{"openapi":"3.0.3","info":{"title":"Circles JSON-RPC API (V2)","version":"1.0.0"},"servers":[{"url":"https://rpc.aboutcircles.com/","description":"Production endpoint"}],"paths":{"/circles_query":{"post":{"summary":"SQL-like indexed query","operationId":"circles_query","description":"Perform a SQL-like query on the indexed data.\n\nUseful query templates (YAML)\n\n### Recent v2 avatar registrations\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"Avatars\"\n    Columns:\n      - \"blockNumber\"\n      - \"timestamp\"\n      - \"transactionHash\"\n      - \"type\"\n      - \"avatar\"\n      - \"tokenId\"\n      - \"name\"\n      - \"cidV0Digest\"\n    Filter:\n      []\n    Order:\n      -\n        Column: \"blockNumber\"\n        SortOrder: \"DESC\"\n      -\n        Column: \"transactionIndex\"\n        SortOrder: \"DESC\"\n      -\n        Column: \"logIndex\"\n        SortOrder: \"DESC\"\n    Limit: 25\n```\n\n### Incoming + outgoing trust relations for an address\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"TrustRelations\"\n    Columns:\n      - \"blockNumber\"\n      - \"timestamp\"\n      - \"truster\"\n      - \"trustee\"\n      - \"expiryTime\"\n    Filter:\n      -\n        Type: \"Conjunction\"\n        ConjunctionType: \"Or\"\n        Predicates:\n          -\n            Type: \"FilterPredicate\"\n            FilterType: \"Equals\"\n            Column: \"truster\"\n            Value: \"0xae3a29a9ff24d0e936a5579bae5c4179c4dff565\"\n          -\n            Type: \"FilterPredicate\"\n            FilterType: \"Equals\"\n            Column: \"trustee\"\n            Value: \"0xae3a29a9ff24d0e936a5579bae5c4179c4dff565\"\n    Order:\n      -\n        Column: \"blockNumber\"\n        SortOrder: \"DESC\"\n      -\n        Column: \"logIndex\"\n        SortOrder: \"DESC\"\n```\n\n### Balances for one account, ordered by demurraged balance\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"BalancesByAccountAndToken\"\n    Columns:\n      - \"account\"\n      - \"tokenAddress\"\n      - \"tokenId\"\n      - \"lastActivity\"\n      - \"totalBalance\"\n      - \"demurragedTotalBalance\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"account\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"demurragedTotalBalance\"\n        SortOrder: \"DESC\"\n    Limit: 50\n```\n\n### Group overview with membership counts\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"Groups\"\n    Columns:\n      - \"group\"\n      - \"name\"\n      - \"symbol\"\n      - \"memberCount\"\n      - \"owner\"\n      - \"mintPolicy\"\n      - \"treasury\"\n      - \"erc20WrapperDemurraged\"\n      - \"erc20WrapperStatic\"\n    Filter:\n      []\n    Order:\n      -\n        Column: \"memberCount\"\n        SortOrder: \"DESC\"\n    Limit: 20\n```\n\n### Members of a group (v2)\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupMemberships\"\n    Columns:\n      - \"group\"\n      - \"member\"\n      - \"memberType\"\n      - \"expiryTime\"\n      - \"timestamp\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n```\n\n### Recent transfers involving an address\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"Transfers\"\n    Columns:\n      - \"blockNumber\"\n      - \"timestamp\"\n      - \"transactionHash\"\n      - \"from\"\n      - \"to\"\n      - \"id\"\n      - \"value\"\n      - \"type\"\n    Filter:\n      -\n        Type: \"Conjunction\"\n        ConjunctionType: \"Or\"\n        Predicates:\n          -\n            Type: \"FilterPredicate\"\n            FilterType: \"Equals\"\n            Column: \"from\"\n            Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n          -\n            Type: \"FilterPredicate\"\n            FilterType: \"Equals\"\n            Column: \"to\"\n            Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"blockNumber\"\n        SortOrder: \"DESC\"\n      -\n        Column: \"transactionIndex\"\n        SortOrder: \"DESC\"\n      -\n        Column: \"logIndex\"\n        SortOrder: \"DESC\"\n    Limit: 100\n```\n\n### Total supply for a specific token\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"TotalSupply\"\n    Columns:\n      - \"tokenAddress\"\n      - \"tokenId\"\n      - \"totalSupply\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"tokenAddress\"\n        Value: \"0x42cedde51198d1773590311e2a340dc06b24cb37\"\n    Order:\n      []\n```\n\n### Holders of a group token with ownership fraction\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupTokenHoldersBalance\"\n    Columns:\n      - \"group\"\n      - \"holder\"\n      - \"demurragedTotalBalance\"\n      - \"fractionOwnership\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"demurragedTotalBalance\"\n        SortOrder: \"DESC\"\n    Limit: 50\n```\n\n### Group token supply (demurraged)\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupTokenSupply\"\n    Columns:\n      - \"group\"\n      - \"totalSupply\"\n      - \"demurragedTotalSupply\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      []\n```\n\n### Group collateral locked by token\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupCollateralByToken\"\n    Columns:\n      - \"group\"\n      - \"id\"\n      - \"amountLocked\"\n      - \"demurragedAmountLocked\"\n      - \"fractionLocked\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"amountLocked\"\n        SortOrder: \"DESC\"\n```\n\n### Group vault balances by token\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupVaultBalancesByToken\"\n    Columns:\n      - \"vault\"\n      - \"id\"\n      - \"balance\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"vault\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"balance\"\n        SortOrder: \"DESC\"\n```\n\n### Daily group member counts\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupMembersCount_1d\"\n    Columns:\n      - \"group\"\n      - \"timestamp\"\n      - \"value\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 30\n```\n\n### Daily wrap/unwrap activity for a group token\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupWrapUnWrap_1d\"\n    Columns:\n      - \"group\"\n      - \"timestamp\"\n      - \"tokenAddress\"\n      - \"tokenType\"\n      - \"wrapAmount\"\n      - \"unwrapAmount\"\n      - \"wrapSupply\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 30\n```\n\n### Daily mint/redeem activity for a group token\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupMintRedeem_1d\"\n    Columns:\n      - \"group\"\n      - \"timestamp\"\n      - \"minted\"\n      - \"burned\"\n      - \"supply\"\n      - \"demurragedMinted\"\n      - \"demurragedBurned\"\n      - \"demurragedSupply\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 30\n```\n\n### Daily affiliate members count\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"AffiliateMembersCount_1d\"\n    Columns:\n      - \"group\"\n      - \"timestamp\"\n      - \"value\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 30\n```\n\n### Daily Balancer vault balance for an ERC20 wrapper\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"Erc20BalancerVaultBalance_1d\"\n    Columns:\n      - \"timestamp\"\n      - \"tokenAddress\"\n      - \"value\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"tokenAddress\"\n        Value: \"0x42cedde51198d1773590311e2a340dc06b24cb37\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 30\n```\n\n### LBP circles backing deployments\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"CrcV2\"\n    Table: \"CirclesBackingDeployed\"\n    Columns:\n      - \"blockNumber\"\n      - \"timestamp\"\n      - \"transactionHash\"\n      - \"emitter\"\n      - \"backer\"\n      - \"circlesBackingInstance\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"backer\"\n        Value: \"0xeced91232c609a42f6016860e8223b8aecaa7bd0\"\n    Order:\n      -\n        Column: \"blockNumber\"\n        SortOrder: \"DESC\"\n    Limit: 100\n```\n\n### Group collateral delta by token\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupCollateralDiffByToken\"\n    Columns:\n      - \"timestamp\"\n      - \"group\"\n      - \"id\"\n      - \"amountLocked\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 100\n```\n\n### Hourly group member counts\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupMembersCount_1h\"\n    Columns:\n      - \"group\"\n      - \"timestamp\"\n      - \"value\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 72\n```\n\n### Hourly wrap/unwrap activity for a group token\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupWrapUnWrap_1h\"\n    Columns:\n      - \"group\"\n      - \"timestamp\"\n      - \"tokenAddress\"\n      - \"tokenType\"\n      - \"wrapAmount\"\n      - \"unwrapAmount\"\n      - \"wrapSupply\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 72\n```\n\n### Hourly mint/redeem activity for a group token\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"GroupMintRedeem_1h\"\n    Columns:\n      - \"group\"\n      - \"timestamp\"\n      - \"minted\"\n      - \"burned\"\n      - \"supply\"\n      - \"demurragedMinted\"\n      - \"demurragedBurned\"\n      - \"demurragedSupply\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 72\n```\n\n### Hourly affiliate members count\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"AffiliateMembersCount_1h\"\n    Columns:\n      - \"group\"\n      - \"timestamp\"\n      - \"value\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"group\"\n        Value: \"0xde374ece6fa50e781e81aac78e811b33d16912c7\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 72\n```\n\n### Hourly Balancer vault balance for an ERC20 wrapper\n\n```yaml\njsonrpc: \"2.0\"\nid: 1\nmethod: \"circles_query\"\nparams:\n  -\n    Namespace: \"V_CrcV2\"\n    Table: \"Erc20BalancerVaultBalance_1h\"\n    Columns:\n      - \"timestamp\"\n      - \"tokenAddress\"\n      - \"value\"\n    Filter:\n      -\n        Type: \"FilterPredicate\"\n        FilterType: \"Equals\"\n        Column: \"tokenAddress\"\n        Value: \"0x42cedde51198d1773590311e2a340dc06b24cb37\"\n    Order:\n      -\n        Column: \"timestamp\"\n        SortOrder: \"DESC\"\n    Limit: 72\n```\n\n\n","requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcRequest"},{"properties":{"method":{"type":"string","enum":["circles_query"]},"params":{"type":"array","minItems":1,"maxItems":1,"items":{"$ref":"#/components/schemas/QueryObject"}}}}]}}}},"responses":{"200":{"description":"Tabular result set.","content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcSuccess"},{"properties":{"result":{"$ref":"#/components/schemas/DatabaseQueryResult"}}}]}}}}}}}},"components":{"schemas":{"JsonRpcRequest":{"type":"object","required":["jsonrpc","method","id","params"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"method":{"type":"string"},"id":{"type":"integer"},"params":{"type":"array","description":"Ordered parameters."}}},"QueryObject":{"type":"object","description":"Query CrcV2 event tables (namespace: CrcV2) or aggregated views (namespace: V_CrcV2). Use circles_tables to discover available columns.","required":["Namespace","Table"],"properties":{"Namespace":{"type":"string","description":"Namespace name (case-insensitive)."},"Table":{"type":"string","description":"Table name (case-insensitive)."},"Columns":{"type":"array","items":{"type":"string"}},"Filter":{"type":"array","items":{"oneOf":[{"$ref":"#/components/schemas/FilterPredicate"},{"$ref":"#/components/schemas/Conjunction"}]}},"Order":{"type":"array","items":{"$ref":"#/components/schemas/OrderBy"}},"Distinct":{"type":"boolean"},"Limit":{"type":"integer","minimum":1}}},"FilterPredicate":{"type":"object","required":["Type","FilterType","Column"],"properties":{"Type":{"type":"string","enum":["FilterPredicate"]},"FilterType":{"type":"string","enum":["Equals","NotEquals","GreaterThan","GreaterThanOrEquals","LessThan","LessThanOrEquals","Like","ILike","NotLike","In","NotIn","IsNotNull","IsNull"]},"Column":{"type":"string"},"Value":{"$ref":"#/components/schemas/AnyValue"}}},"AnyValue":{"nullable":true,"oneOf":[{"type":"string"},{"type":"number"},{"type":"boolean"},{"type":"object","additionalProperties":true},{"type":"array","items":{"$ref":"#/components/schemas/AnyValue"}}]},"Conjunction":{"type":"object","required":["Type","ConjunctionType","Predicates"],"properties":{"Type":{"type":"string","enum":["Conjunction"]},"ConjunctionType":{"type":"string","enum":["And","Or"]},"Predicates":{"type":"array","items":{"oneOf":[{"$ref":"#/components/schemas/FilterPredicate"},{"$ref":"#/components/schemas/Conjunction"}]}}}},"OrderBy":{"type":"object","properties":{"Column":{"type":"string"},"SortOrder":{"type":"string","enum":["ASC","DESC"]}}},"JsonRpcSuccess":{"type":"object","required":["jsonrpc","id","result"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"id":{"type":"integer"},"result":{"description":"Method-specific payload."}}},"DatabaseQueryResult":{"type":"object","required":["columns","rows"],"properties":{"columns":{"type":"array","items":{"type":"string"}},"rows":{"type":"array","items":{"type":"array","items":{"$ref":"#/components/schemas/AnyValue"}}}}}}}}
````

## POST /circles\_events

> Stream / log event query

```json
{"openapi":"3.0.3","info":{"title":"Circles JSON-RPC API (V2)","version":"1.0.0"},"servers":[{"url":"https://rpc.aboutcircles.com/","description":"Production endpoint"}],"paths":{"/circles_events":{"post":{"summary":"Stream / log event query","operationId":"circles_events","requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcRequest"},{"properties":{"method":{"type":"string","enum":["circles_events"]},"params":{"type":"array","minItems":2,"maxItems":6,"items":{"oneOf":[{"$ref":"#/components/schemas/NullableAddress"},{"type":"integer","format":"int64"},{"type":"integer","format":"int64","nullable":true},{"type":"array","items":{"type":"string"},"nullable":true},{"type":"array","items":{"$ref":"#/components/schemas/FilterPredicate"},"nullable":true},{"type":"boolean","nullable":true}]},"description":"[address|null, fromBlock, toBlock|null, eventTypes?, filter?, ascending?]"}}}]}}}},"responses":{"200":{"description":"Array of event objects.","content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcSuccess"},{"properties":{"result":{"type":"array","items":{"$ref":"#/components/schemas/CirclesEvent"}}}}]}}}}}}}},"components":{"schemas":{"JsonRpcRequest":{"type":"object","required":["jsonrpc","method","id","params"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"method":{"type":"string"},"id":{"type":"integer"},"params":{"type":"array","description":"Ordered parameters."}}},"NullableAddress":{"allOf":[{"$ref":"#/components/schemas/Address"}],"nullable":true,"description":"Address or null."},"Address":{"type":"string","pattern":"^0x[a-fA-F0-9]{40}$","description":"Ethereum 20-byte address."},"FilterPredicate":{"type":"object","required":["Type","FilterType","Column"],"properties":{"Type":{"type":"string","enum":["FilterPredicate"]},"FilterType":{"type":"string","enum":["Equals","NotEquals","GreaterThan","GreaterThanOrEquals","LessThan","LessThanOrEquals","Like","ILike","NotLike","In","NotIn","IsNotNull","IsNull"]},"Column":{"type":"string"},"Value":{"$ref":"#/components/schemas/AnyValue"}}},"AnyValue":{"nullable":true,"oneOf":[{"type":"string"},{"type":"number"},{"type":"boolean"},{"type":"object","additionalProperties":true},{"type":"array","items":{"$ref":"#/components/schemas/AnyValue"}}]},"JsonRpcSuccess":{"type":"object","required":["jsonrpc","id","result"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"id":{"type":"integer"},"result":{"description":"Method-specific payload."}}},"CirclesEvent":{"type":"object","required":["Event","Values"],"properties":{"Event":{"type":"string"},"Values":{"type":"object","additionalProperties":true}}}}}}
```

## POST /circles\_health

> System health probe

```json
{"openapi":"3.0.3","info":{"title":"Circles JSON-RPC API (V2)","version":"1.0.0"},"servers":[{"url":"https://rpc.aboutcircles.com/","description":"Production endpoint"}],"paths":{"/circles_health":{"post":{"summary":"System health probe","operationId":"circles_health","requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcRequest"},{"properties":{"method":{"type":"string","enum":["circles_health"]},"params":{"type":"array","minItems":0,"maxItems":0,"items":{"$ref":"#/components/schemas/AnyValue"}}}}]}}}},"responses":{"200":{"description":"Health status.","content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcSuccess"},{"properties":{"result":{"type":"string"}}}]}}}}}}}},"components":{"schemas":{"JsonRpcRequest":{"type":"object","required":["jsonrpc","method","id","params"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"method":{"type":"string"},"id":{"type":"integer"},"params":{"type":"array","description":"Ordered parameters."}}},"AnyValue":{"nullable":true,"oneOf":[{"type":"string"},{"type":"number"},{"type":"boolean"},{"type":"object","additionalProperties":true},{"type":"array","items":{"$ref":"#/components/schemas/AnyValue"}}]},"JsonRpcSuccess":{"type":"object","required":["jsonrpc","id","result"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"id":{"type":"integer"},"result":{"description":"Method-specific payload."}}}}}}
```

## POST /circles\_tables

> List namespaces, tables, and columns

```json
{"openapi":"3.0.3","info":{"title":"Circles JSON-RPC API (V2)","version":"1.0.0"},"servers":[{"url":"https://rpc.aboutcircles.com/","description":"Production endpoint"}],"paths":{"/circles_tables":{"post":{"summary":"List namespaces, tables, and columns","operationId":"circles_tables","requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcRequest"},{"properties":{"method":{"type":"string","enum":["circles_tables"]},"params":{"type":"array","minItems":0,"maxItems":0,"items":{"$ref":"#/components/schemas/AnyValue"}}}}]}}}},"responses":{"200":{"description":"Namespace/table catalogue.","content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/JsonRpcSuccess"},{"properties":{"result":{"type":"array","items":{"$ref":"#/components/schemas/DatabaseNamespace"}}}}]}}}}}}}},"components":{"schemas":{"JsonRpcRequest":{"type":"object","required":["jsonrpc","method","id","params"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"method":{"type":"string"},"id":{"type":"integer"},"params":{"type":"array","description":"Ordered parameters."}}},"AnyValue":{"nullable":true,"oneOf":[{"type":"string"},{"type":"number"},{"type":"boolean"},{"type":"object","additionalProperties":true},{"type":"array","items":{"$ref":"#/components/schemas/AnyValue"}}]},"JsonRpcSuccess":{"type":"object","required":["jsonrpc","id","result"],"properties":{"jsonrpc":{"type":"string","enum":["2.0"]},"id":{"type":"integer"},"result":{"description":"Method-specific payload."}}},"DatabaseNamespace":{"type":"object","required":["Namespace","Tables"],"properties":{"Namespace":{"type":"string"},"Tables":{"type":"array","items":{"$ref":"#/components/schemas/DatabaseTable"}}}},"DatabaseTable":{"type":"object","required":["Table","Topic","Columns"],"properties":{"Table":{"type":"string"},"Topic":{"type":"string","description":"Event topic (0x-prefixed)."},"Columns":{"type":"array","items":{"$ref":"#/components/schemas/DatabaseColumn"}}}},"DatabaseColumn":{"type":"object","required":["Column","Type"],"properties":{"Column":{"type":"string"},"Type":{"type":"string"}}}}}}
```


---

# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.aboutcircles.com/api-reference/circles-api.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
