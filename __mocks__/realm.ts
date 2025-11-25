class MockObjectId {
  private _id?: string;
  constructor(id?: string) {
    this._id = id;
  }
  toHexString() {
    return this._id || "mockid";
  }
}

export default class Realm {
  static BSON = { ObjectId: MockObjectId };
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


