export const chatContextAbi = [
  {
    type: 'function',
    name: 'fetchLastMainMessages',
    stateMutability: 'view',
    inputs: [
      { name: 'includeDeleted_', type: 'bool' },
      { name: 'length_', type: 'uint256' },
    ],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'author', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'deleted', type: 'bool' },
          { name: 'index', type: 'uint256' },
          { name: 'repliesCount', type: 'uint256' },
          { name: 'url', type: 'string' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'fetchLastReplies',
    stateMutability: 'view',
    inputs: [
      { name: 'includeDeleted_', type: 'bool' },
      { name: 'mainMsgIndex_', type: 'uint256' },
      { name: 'length_', type: 'uint256' },
    ],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'author', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'deleted', type: 'bool' },
          { name: 'index', type: 'uint256' },
          { name: 'repliesCount', type: 'uint256' },
          { name: 'url', type: 'string' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getMainMessageCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'price',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'isUserMod',
    stateMutability: 'view',
    inputs: [{ name: 'user_', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'createMessage',
    stateMutability: 'payable',
    inputs: [{ name: 'url_', type: 'string' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'createReply',
    stateMutability: 'payable',
    inputs: [
      { name: 'mainMsgIndex_', type: 'uint256' },
      { name: 'url_', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'deleteMessage',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'mainMsgIndex_', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'deleteReply',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'mainMsgIndex_', type: 'uint256' },
      { name: 'replyMsgIndex_', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;
