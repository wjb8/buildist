class MockObjectId {
  private static counter = 0;
  private _id: string;
  constructor(id?: string) {
    if (id) {
      this._id = id;
    } else {
      MockObjectId.counter += 1;
      this._id = `mockid-${MockObjectId.counter}`;
    }
  }
  toHexString() {
    return this._id;
  }
  toString() {
    return this._id;
  }
}

export default class Realm {
  static BSON = { ObjectId: MockObjectId };
  static Object = class {};
  write(fn: () => void) {
    fn();
  }
  create(_type: string, _obj: any) {}
  objects(_type: string) {
    return {
      filtered: (_q: string, _v: any) => ({
        map: (_fn: (x: any) => any) => [],
      }),
      map: (_fn: (x: any) => any) => [],
    };
  }
  objectForPrimaryKey(_type: string, _id: any) {
    return null;
  }
  delete(_obj: any) {}
}





