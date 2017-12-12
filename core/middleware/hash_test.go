package middleware

import "testing"

func TestSha512Hash(t *testing.T) {
    h := &Home{
        X: "13",
        Y: "14",
    }
    p := &People{
        X: "123",
        Y: "321",
        Name: "Mike",
    }
    o := &Object{
        P: p,
        H: h,
        Name: "Mike's Object",
    }

    c := Sha512Hash{
        Encoder: &GobEncoder{},
    }
    result, err := c.Hash(o)
    if err != nil {
        t.Errorf("Test FileHandler.Sha512Hash failed, get error: %s", err.Error())
    }
    result2, err := c.Hash(o)
    if err != nil {
        t.Errorf("Test FileHandler.Sha512Hash failed, get error: %s", err.Error())
    }
    if result != result2 {
        t.Errorf("Test FileHandler.Sha512Codec failed, get unexpected result")
    }
}
