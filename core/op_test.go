package core

import (
    "testing"
    "errors"
    "encoding/json"
    "bytes"
    "fmt"
)

type object struct{
    p1 string
}

func TestInArray(t *testing.T) {
    tests := []struct{
        val interface{}
        array interface{}
        exp1 bool
        exp2 int
    }{
        {0, 0, false, -1}, // not array or slice as input
        {nil, 0, false, -1},
        {0, nil, false, -1},
        {nil, nil, false, -1},
        {"a", []int{1, 2, 3}, false, -1},
        {1, []int{1, 2, 3}, true, 0}, // slice test
        {2, [3]int{1, 2, 3}, true, 1}, // array test
        {[]int{3}, []int{1, 2, 3}, false, -1}, // all slice input
        {object{"a"}, []int{1, 2, 3}, false, -1}, // object slice input
        {object{"b"}, []object{{"a"},{"b"},{"c"}}, true, 1},
    }

    for _, test := range tests {
        result1, result2 := InArray(test.val, test.array)
        if result1 != test.exp1 || result2 != test.exp2 {
            t.Errorf("Test InArray failed with input %s, %s, expect (%s, %s), get (%s, %s)",
                test.val, test.array, test.exp1, test.exp2, result1, result2)
        }
    }
}

type object2 struct{
    P1 string
    P2 int
    P3 error
}

func TestDecodeCommonData(t *testing.T) {
    validData1 := &CommonData{
        ActionType: MatchingActionKey,
        RequestPlayerId: "test-host-id-1234567",
        HostId: "test-host-id-1234567",
        GuestId: "test-guest-id-1234567",
        HostX: 40.3,
        GuestX: 365.5,
        HostY: 123.7,
        GuestY: 789.5,
    }
    validInput1, err := json.Marshal(validData1)
    if err != nil {
        t.Fatalf("Fatal Error Test DecodeCommonData failed with  err: %s", err.Error())
    }
    validData2 := &CommonData{}
    validInput2, err := json.Marshal(validData2)
    if err != nil {
        t.Fatalf("Fatal Error Test DecodeCommonData failed with  err: %s", err.Error())
    }
    inValidData1 := struct {
        ParamA string
        ParamB int
        ParamC *object2
    }{
        ParamA: "123",
        ParamB: 16,
        ParamC: &object2{
            P1: "345",
            P2: 60,
            P3: errors.New(""),
        },
    }
    invalidInput1, err := json.Marshal(inValidData1)
    if err != nil {
        t.Fatalf("Fatal Error Test DecodeCommonData failed with  err: %s", err.Error())
    }
    invalidInput2 := []byte{71, 232, 14, 232, 168, 60}
    tests := []struct{
        testType string
        input []byte
        exp1 *CommonData
        exp2 error
    }{
        {
            testType: "valid",
            input: validInput1,
            exp1: validData1,
            exp2: nil,
        },
        {
            testType: "valid",
            input: validInput2,
            exp1: validData2,
            exp2: nil,
        },
        {
            testType: "invalid",
            input: invalidInput1,
            exp1: nil,
        },
        {
            testType: "invalid",
            input: invalidInput2,
            exp1: nil,
        },
        {
            testType: "invalid",
            input: nil,
            exp1: nil,
        },
    }

    for _, test := range tests {
        if test.testType == "valid" {
            result, err := DecodeCommonData(test.input)
            if err != nil {
                t.Errorf("Test DecodeCommonData failed with valid input got err: %s", err.Error())
            } else if *result != *test.exp1 || err != test.exp2 {
                t.Errorf("Test DecodeCommonData failed with input %s, expect (%s, %s), get (%s, %s)",
                    test.input, test.exp1, test.exp2, result, err)
            }
        }
        if test.testType == "invalid" {
            result, err := DecodeCommonData(test.input)
            if result != test.exp1 {
                t.Errorf("Test DecodeCommonData failed, invaid input, but get not nil result: %s", *result)
            }
            if err == nil {
                t.Errorf("Test DecodeCommonData failed, invaid input, but no get error")
            }
        }
    }
}

func TestEncodeCommonDada(t *testing.T) {
    validInput1 := &CommonData{
        ActionType: MatchingActionKey,
        RequestPlayerId: "test-host-id-1234567",
        HostId: "test-host-id-1234567",
        GuestId: "test-guest-id-1234567",
        HostX: 40.3,
        GuestX: 365.5,
        HostY: 123.7,
        GuestY: 789.5,
    }
    input1Exp, err := json.Marshal(validInput1)
    if err != nil {
        t.Fatalf("Fatal Error Test EncodeCommonDada failed with  err: %s", err.Error())
    }

    validInput2 := &CommonData{
        ActionType: "",
        RequestPlayerId: "",
        HostId: "",
        GuestId: "",
        HostX: 0.0,
        GuestX: 0.0,
        HostY: 0.0,
        GuestY: 0.0,
    }
    input2Exp, err := json.Marshal(validInput2)
    if err != nil {
        t.Fatalf("Fatal Error Test EncodeCommonDada failed with  err: %s", err.Error())
    }

    validInput3 := &CommonData{
        ActionType: "+_)(*&^%$#@!~<>",
        RequestPlayerId: "{xxx: 789, yyy: 16}",
        HostId: "",
        GuestId: "",
        HostX: 0.0,
        GuestX: 0.0,
        HostY: 0.0,
        GuestY: 0.0,
    }
    input3Exp, err := json.Marshal(validInput3)
    if err != nil {
        t.Fatalf("Fatal Error Test EncodeCommonDada failed with  err: %s", err.Error())
    }

    tests := []struct{
        input *CommonData
        exp []byte
    }{
        {
            validInput1,
            input1Exp,
        },
        {
            validInput2,
            input2Exp,
        },
        {
            validInput3,
            input3Exp,
        },
    }
    for _, test := range tests {
        result, err := EncodeCommonDada(test.input)
        if err != nil {
            t.Errorf("Test EncodeCommonDada failed with valid input got err: %s", err.Error())
        } else if bytes.Compare(result, test.exp) != 0  {
            t.Errorf("Test EncodeCommonDada failed with input %s, expect (%s, %s), get (%s, %s)",
                test.input, test.exp, "nil", result, err)
        }
    }
}

func TestMakeRandomContext(t *testing.T) {
    c1, err := MakeRandomContext(32)
    if err !=nil {
        t.Errorf("Test new MakeRandomContext failed, get error : %s", err.Error())
    }
    fmt.Println(c1)
    c2, err := MakeRandomContext(32)
    if err !=nil {
        t.Errorf("Test new MakeRandomContext failed, get error : %s", err.Error())
    }
    if c1 == c2 {
        t.Errorf("Test new MakeRandomContext failed, get same context")
    }
}
