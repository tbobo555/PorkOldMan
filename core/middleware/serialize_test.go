package middleware

import (
    "reflect"
    "testing"
)

func TestGobEncoder(t *testing.T) {
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
    dst := &Object{}
    gob := GobEncoder{}
    se, err := gob.Serialize(o)
    if err != nil {
        t.Errorf("Test FileHandler.GobEncoder failed, get error: %s", err.Error())
    }
    err = gob.Deserialize(se, dst)
    if err != nil {
        t.Errorf("Test FileHandler.GobEncoder failed, get error: %s", err.Error())
    }
    if dst.Name != "Mike's Object" {
        t.Errorf("Test FileHandler.GobEncoder failed, no get expect output")
    }
    if reflect.DeepEqual(dst.P, p) != true {
        t.Errorf("Test FileHandler.GobEncoder failed, no get expect output")
    }
    if reflect.DeepEqual(dst.H, h) != true {
        t.Errorf("Test FileHandler.GobEncoder failed, no get expect output")
    }
    fakeDst := &Home{}
    err = gob.Deserialize(se, fakeDst)
    if err == nil {
        t.Errorf("Test FileHandler.GobEncoder failed, fake input, but no get error")
    }
    err = gob.Deserialize(se, nil)
    if err == nil {
        t.Errorf("Test FileHandler.GobEncoder failed, fake input, but no get error")
    }
    var i interface{}
    err = gob.Deserialize(se, i)
    if err == nil {
        t.Errorf("Test FileHandler.GobEncoder failed, fake input, but no get error")
    }
    err = gob.Deserialize(se, 123)
    if err == nil {
        t.Errorf("Test FileHandler.GobEncoder failed, fake input, but no get error")
    }
    err = gob.Deserialize(se, "123")
    if err == nil {
        t.Errorf("Test FileHandler.GobEncoder failed, fake input, but no get error")
    }
    _, err = gob.Serialize(nil)
    if err == nil {
        t.Errorf("Test FileHandler.GobEncoder failed, fake input, but no get error")
    }
}
