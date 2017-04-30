
import index = require("../src/index");
import * as chai from "chai";

const expect = chai.expect;

describe("index", () => {
  it("should provide KVCache", () => {
    expect(index.KVCache).to.not.be.undefined;
  });
});
