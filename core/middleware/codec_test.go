package middleware

import (
    "testing"
    "reflect"
)

type Object struct {
    P *People
    H *Home
    Name string
}

type Home struct {
    X string
    Y string
}

type People struct {
    X string
    Y string
    Name string
}

func TestAesCodec(t *testing.T) {
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
    aes := &AesCbcCodec{
        Key: "1234567890abcdef1234567890abcdef",
        Padding: "=",
        Encoder: &GobEncoder{},
    }
    result ,err := aes.Encode(o)
    if err != nil {
        t.Errorf("Test FileHandler.AesCbcCodec failed, get error: %s", err.Error())
    }
    aes2 := &AesCbcCodec{
        Key: "1234567890abcdef1234567890abcdef",
        Padding: "=",
        Encoder: &GobEncoder{},
    }
    dst := &Object{}
    err = aes2.Decode(result, dst)
    if err != nil {
        t.Errorf("Test FileHandler.AesCbcCodec failed, get error: %s", err.Error())
    }
    if dst.Name != "Mike's Object" {
        t.Errorf("Test FileHandler.AesCbcCodec failed, no get expect output")
    }
    if reflect.DeepEqual(dst.P, p) != true {
        t.Errorf("Test FileHandler.AesCbcCodec failed, no get expect output")
    }
    if reflect.DeepEqual(dst.H, h) != true {
        t.Errorf("Test FileHandler.AesCbcCodec failed, no get expect output")
    }

    fakeDst := &Home{}
    err = aes2.Decode(result, fakeDst)
    if err == nil {
        t.Errorf("Test FileHandler.AesCbcCodec failed, fake input, but no get error")
    }
    err = aes2.Decode(result, "213")
    if err == nil {
        t.Errorf("Test FileHandler.AesCbcCodec failed, invlaid input, but no get error")
    }
    err = aes2.Decode(result, nil)
    if err == nil {
        t.Errorf("Test FileHandler.AesCbcCodec failed, invlaid input, but no get error")
    }
    _ , err = aes.Encode(nil)
    if err == nil {
        t.Errorf("Test FileHandler.AesCbcCodec failed, nil input, but no get error")
    }
}
