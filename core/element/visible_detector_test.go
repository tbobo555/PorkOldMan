package element

import (
    "testing"
    "time"
)

func TestVisibleDetector(t *testing.T) {
    vd := NewVisibleDetector(0.3)
    if vd.IsRunning != false {
        t.Errorf("Test new VisibleDetector failed, expected IsRunning false, found true")
    }
    if vd.IsVisible != false {
        t.Errorf("Test new VisibleDetector failed, expected IsVisible false, found true")
    }
    vd.Reset()
    if vd.IsVisible != true {
        t.Errorf("Test VisibleDetector.Reset failed, expected IsVisible true, found false")
    }
    // multiple launch test
    go vd.Run()
    go vd.Run()
    time.Sleep(500 * time.Millisecond)
    if vd.IsRunning != true {
        t.Errorf("Test VisibleDetector.Run failed, expected IsRunning true, found false")
    }
    if vd.IsVisible != false {
        t.Errorf("Test VisibleDetector.Run failed, expected IsVisible false, found true")
    }
    time.Sleep(500 * time.Millisecond)
    vd.Reset()
    if vd.IsVisible != true {
        t.Errorf("Test VisibleDetector.Reset failed, expected IsVisible true, found false")
    }
    // multiple launch test
    vd.Stop()
    vd.Stop()
    if vd.IsRunning != false {
        t.Errorf("Test VisibleDetector.Stop failed, expected IsRunning false, found true")
    }
}
