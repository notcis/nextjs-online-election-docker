import { decryptLineToken } from "./lib/crypto";

const token_1 =
  "28663b6e1af09fd391988a00d75dddbd:ed11f3ebd1263493dcec38c7a9d22af8";
const token_2 =
  "0526280f69ad1be51e25f555c946c13d:23f2db41b79999f7cc96d899a233accc";

const member_id = decryptLineToken(token_1);
console.log(member_id);

const member_id2 = decryptLineToken(token_2);
console.log(member_id2);
