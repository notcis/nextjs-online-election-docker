import { decryptLineToken } from "./lib/crypto";

const token_1 =
  "41482309fb295059ec92cb8a1d96cc41:f8f9ba8b651f1cffce7e7b032fdb362a";
const token_2 =
  "0526280f69ad1be51e25f555c946c13d:23f2db41b79999f7cc96d899a233accc";

const member_id = decryptLineToken(token_1);
console.log(member_id);

const member_id2 = decryptLineToken(token_2);
console.log(member_id2);
