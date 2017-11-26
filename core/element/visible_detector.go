package element

import "time"

type VisibleDetector struct {
    MaxWaitingPeriod float32
    Ticker *time.Ticker
    Counter float32
    IsVisible bool
    IsRunning bool
}

func NewVisibleDetector(maxWaitingPeriod float32) *VisibleDetector{
    return &VisibleDetector{
        MaxWaitingPeriod: maxWaitingPeriod,
        Ticker: nil,
        Counter: 0,
        IsVisible: false,
        IsRunning: false,
    }
}

func (vd *VisibleDetector) Run() {
    if vd.IsRunning == true {
        return
    }
    vd.IsRunning = true
    vd.Ticker = time.NewTicker(time.Millisecond * 100)
    defer func() {
        vd.Stop()
    }()
    for {
        select {
        case <-vd.Ticker.C:
            if vd.Counter >= vd.MaxWaitingPeriod {
                vd.IsVisible = false
            }
            if vd.Counter >= 300 {
                vd.Counter = vd.MaxWaitingPeriod
            }
            vd.Counter += 0.1
        }
    }
}

func (vd *VisibleDetector) Reset() {
    vd.Counter = 0
    vd.IsVisible = true
}

func (vd *VisibleDetector) Stop() {
    vd.Counter = 0
    vd.IsRunning = false
    vd.Ticker.Stop()
}
