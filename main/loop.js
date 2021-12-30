// node myFile.js

const pendingTimers = [];
const pendingOSTasks = [];
const pendingOperations = [];


// Ne timers, tasks, oeprations are record from myFile running.
myFile.runContents();


function shouldContinue() {
    // Check one: Any pending setTimeout, setInterval, setImmediate
    // Check two: Any pending OS tasks? (like server listening to port)
    // Check three: Any long running operations? (Like fs module)
    return pendingTimers.length || pendingOSTasks.length || pendingOperations.length;
}

// Entire body execute in one 'tick'
while(shouldContinue) {
    // 1) Node loops at pendingTimers and sees if any functions are ready to be called. settimeout, setInterval

    // 2) Node looks pending osTaks and pending operations and calls relevant callbacks.

    // 3) Pause execution. Continue when...
    // - a new pendingOSTask is done
    // - a new pendingOperation is done
    // - a timer is about to complete

    // 4) Look at pendingTimers. Call any setImmediate.

    // 5) Handle any 'close' events.
}

// exit back to terminal