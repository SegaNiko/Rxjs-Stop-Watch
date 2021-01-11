import React, {useState, useEffect, useRef} from 'react'

import {interval, fromEvent, merge, NEVER} from "rxjs"
import {map, takeUntil, mapTo, scan, startWith,switchMap, tap} from "rxjs/operators"
import Navbar from '../NavBar/Navbar'
import Footer from '../Footer/Footer'


const App = () => {
  const [time, setTime] = useState({ ms: 0, s: 0, m: 0, h: 0 }); 

  const startButton = useRef(null);
  const stopButton = useRef(null);
  const waitBtn = useRef(null);
  const resetBtn = useRef(null);

  
  let updatedMs = time.ms,
  updatedS = time.s,
  updatedM = time.m,
  updatedH = time.h;

  const run = (v) => {
    if (v === 0 ) {
      setTime({ ms: 0, s: 0, m: 0, h: 0 })
      updatedMs = 0;
      updatedS = 0;
      updatedM = 0;
      updatedH = 0;
      return 
    }
    if (updatedM === 60) {
      updatedH++;
      updatedM = 0;
    }
    if (updatedS === 60) {
      updatedM++;
      updatedS = 0;
    }
    if (v % 100 === 0 ) {
      updatedS++;
    }
    
    return setTime({ ms: updatedMs, s: updatedS, m: updatedM, h: updatedH });
  };
  
 useEffect(() => {
  const getElem = (id) => id.current
  const fromClick = (id) => fromEvent(getElem(id) , 'click');
  const fromClickAndMapTo = (id, obj ) =>
    fromClick(id).pipe(mapTo(obj));
  
  const eventsTimer$ = merge(
    fromClickAndMapTo(startButton, { count: true, wait: false }),
    fromClickAndMapTo(stopButton, { count: false }),
    fromClickAndMapTo(resetBtn, { value: 0, wait: false}),
  )

  const stopWatch$ = eventsTimer$.pipe(
    startWith({
      count: false,
      value: 0,
      wait: false
    }),
    scan((state, curr) => ({ ...state, ...curr }), {}),
    tap((state) => {
      run(state.value)
    }),
    switchMap((state) =>
      state.count
        ? interval(10).pipe(
            map(v => run(v)),
            takeUntil(fromEvent(getElem(waitBtn), "click"))
          )
        : NEVER
    )
  );

  stopWatch$.subscribe();

  const un = stopWatch$

   return () => {
      un.unsubscribe()
   }
 }, [])

  return (
    <>
      <Navbar />
      <main>
        <h1 className="center">Timer</h1>
        <h3 className="center">{`${time.h}:${time.m}:${time.s}`}</h3>
        <div className="center">  
        <button ref={startButton} className="waves-effect waves-light btn-large teal darken-1 mr-1r">Start</button>
        <button  ref={stopButton}  className="waves-effect waves-light btn-large teal darken-1 mr-1r">Stop</button>
        <button ref={waitBtn}  className="waves-effect waves-light btn-large teal darken-1 mr-1r">Wait</button>
        <button ref={resetBtn} className="waves-effect waves-light btn-large teal darken-1 mr-1r">Reset</button>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;
