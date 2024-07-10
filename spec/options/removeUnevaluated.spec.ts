import _Ajv2019 from "../ajv2019"
import chai from "../chai"
chai.should()

describe("removeUnevaluated option", () => {
  it("should remove properties that would error when `unevaluatedProperties = false`", () => {
    const ajv = new _Ajv2019({removeUnevaluated: true})

    ajv.addSchema({
      $id: "//test/fooBar",
      type: "object",
      properties: {
        foo: {type: "string"},
        bar: {type: "string"},
        baz: {
          type: "object",
          properties: {
            qux: {type: "string"},
          },
        },
      },
      unevaluatedProperties: false,
    })

    const object = {
      foo: "foo",
      bar: "bar",
      removeMe: "remove-me",
      baz: {
        qux: "qux",
        notRemoved: "not-removed",
      },
    }

    ajv.validate("//test/fooBar", object).should.equal(true)
    object.should.deep.equal({
      foo: "foo",
      bar: "bar",
      baz: {
        qux: "qux",
        notRemoved: "not-removed",
      },
    })
  })

  it("should remove properties that would error when `unevaluatedProperties = false` across `allOf`", () => {
    const ajv = new _Ajv2019({removeUnevaluated: true})

    ajv.addSchema({
      $id: "//test/fooBar",
      type: "object",
      properties: {
        baz: {type: "string"},
      },
      allOf: [
        {
          properties: {foo: {type: "string"}},
        },
        {
          properties: {bar: {type: "string"}},
        },
      ],
      unevaluatedProperties: false,
    })

    const object = {
      foo: "foo",
      bar: "bar",
      baz: "baz",
      removeMe: "to-be-removed",
    }

    ajv.validate("//test/fooBar", object).should.equal(true)
    object.should.deep.equal({
      foo: "foo",
      bar: "bar",
      baz: "baz",
    })
  })

  it("should remove properties that would error when `unevaluatedProperties = false` (many properties, invalid schema)", () => {
    const ajv = new _Ajv2019({
      removeUnevaluated: true,
      // Note: Since the schema being evaluated below is not valid, this test will only pass with `allErrors:
      // true`, otherwise AJV will abort validation and therefore not get to the point where all evaluated
      // properties were collected and all other properties can be removed.
      allErrors: true,
    })

    const schema = {
      type: "object",
      properties: {
        obj: {
          type: "object",
          unevaluatedProperties: false,
          properties: {
            a: {type: "string"},
            b: false,
            c: {type: "string"},
            d: {type: "string"},
            e: {type: "string"},
            f: {type: "string"},
            g: {type: "string"},
            h: {type: "string"},
            i: {type: "string"},
          },
        },
      },
    }

    const data = {
      obj: {
        a: "valid",
        b: "should not be removed",
        unevaluated: "will be removed",
      },
    }

    // The schema above is not valid due to `b: false`
    ajv.validate(schema, data).should.equal(false)
    data.should.eql({
      obj: {
        a: "valid",
        b: "should not be removed",
      },
    })
  })
})
