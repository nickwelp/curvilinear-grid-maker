import React, { useEffect, useRef, useState }  from "react";
import Slider from '@mui/material/Slider';

const MapMaker = () => {
  let canvas;
  const saveImage = () => {  
    if(canvas){
      var imageObject = new Image();
      imageObject.src = canvas.toDataURL("image/png");      

      var imageElement = document.getElementById("myPix");  
      imageElement.src = imageObject.src;    
      // Saving it locally automatically
      let link = document.createElement("a");
      link.setAttribute('download', "download")
      link.href= imageElement.src
      link.click()         
    }      
 } 

  const canvasRef = useRef(null);
  const [NUMBER_OF_STEPS, updateNumberOfSteps] = useState(7);
  const [PAPER_CROPPING_WIDTH, updatePAPER_CROPPING_WIDTH] = useState(600);
  const [PAPER_CROPPING_HEIGHT, updatePAPER_CROPPING_HEIGHT ] = useState(600);
  const [PRIMARY_SPHEROID_HEIGHT, updatePRIMARY_SPHEROID_HEIGHT ] = useState(600);
  const [PRIMARY_SPHEROID_WIDTH, updatePRIMARY_SPHEROID_WIDTH ] = useState(600);
  const [UPPER_EXTENSIONS, updateUPPER_EXTENSIONS ] = useState(1);
  const [widthNudge, updatewidthNudge ] = useState( 0);
  const [heightNudge, updateheightNudge ] = useState(0);
  const [superRotation, updatesuperRotation ] = useState(0);
  const [primaryAngle, updateprimaryAngle ] = useState(36);
  const [secondaryAngle, updatesecondaryAngle ] = useState( 18);

  const radiansArray = Array(36).fill(0).map((_,i) => (Math.PI/36) * i);
  const primaryCircleAngle = radiansArray[primaryAngle];
  const secondaryCircleAngle = radiansArray[secondaryAngle];
  const centerVanishingPoint = {
    x: (PRIMARY_SPHEROID_WIDTH/2) + widthNudge, 
    y: (PRIMARY_SPHEROID_HEIGHT/2) + heightNudge
  }

  const rotate = (cx, cy, x, y, angle) => {
    var radians = angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
      if (isNaN(nx)) nx = 0;
      if (isNaN(ny)) ny = 0;
    return [nx, ny];
  }
  


  useEffect(()=> { 
    canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const makeCollapsingCircle = (rotation = 0, wN = 0, hN = 0) => {
      const upper_extensions = wN === 0 && hN === 0 ? UPPER_EXTENSIONS : 1;
      const [centerWidth, centerHeight] = rotate(
        centerVanishingPoint.x,
        centerVanishingPoint.y,
        centerVanishingPoint.x + wN,
        centerVanishingPoint.y + hN,
        -1*radiansArray[superRotation]
      );
      for(let i = 0; i<NUMBER_OF_STEPS + upper_extensions; ++i) {
        ctx.beginPath();
        ctx.ellipse(centerWidth, centerHeight, ((PRIMARY_SPHEROID_WIDTH/2)/NUMBER_OF_STEPS) * i, PRIMARY_SPHEROID_HEIGHT/2, radiansArray[superRotation] + rotation, 0, 2 * Math.PI);
        ctx.stroke();		
        ctx.closePath()
      }
    }


    const makeCollapsingCirclePerp = (rotation = 0, wN = 0, hN = 0) => {
      const upper_extensions = wN === 0 && hN === 0 ? UPPER_EXTENSIONS : 1;
      const [centerWidth, centerHeight] = rotate(
        centerVanishingPoint.x,
        centerVanishingPoint.y,
        centerVanishingPoint.x + wN,
        centerVanishingPoint.y + hN,
        -1*radiansArray[superRotation]
      );
      for(let i = 0; i<NUMBER_OF_STEPS + upper_extensions; ++i) {
        ctx.beginPath();
        ctx.ellipse(centerWidth, centerHeight, PRIMARY_SPHEROID_WIDTH/2, ((PRIMARY_SPHEROID_WIDTH/2)/NUMBER_OF_STEPS) * i, (radiansArray[superRotation] + rotation) + Math.PI/2, 0, 2 * Math.PI);
        ctx.stroke();		
        ctx.closePath()
      }
    }

    ctx.strokeStyle = 'rgb(0,0,152)';
    // Draw the ellipse
    makeCollapsingCircle(primaryCircleAngle);
    makeCollapsingCircle(primaryCircleAngle, PRIMARY_SPHEROID_WIDTH, 0);
    makeCollapsingCircle(primaryCircleAngle,-1 * PRIMARY_SPHEROID_WIDTH, 0);
    makeCollapsingCircle(primaryCircleAngle,0, -1 * PRIMARY_SPHEROID_HEIGHT);
    makeCollapsingCircle(primaryCircleAngle,0, PRIMARY_SPHEROID_HEIGHT);

    makeCollapsingCirclePerp(secondaryCircleAngle);
    makeCollapsingCirclePerp(secondaryCircleAngle, 0, -1 * PRIMARY_SPHEROID_HEIGHT);
    makeCollapsingCirclePerp(secondaryCircleAngle, 0, PRIMARY_SPHEROID_HEIGHT);
    makeCollapsingCirclePerp(secondaryCircleAngle, PRIMARY_SPHEROID_WIDTH, 0);
    makeCollapsingCirclePerp(secondaryCircleAngle, -1 * PRIMARY_SPHEROID_WIDTH, 0);

    const makeVanishingLines = (a = 18) => {
      for(let i = 0; i < a; i++) {
        if( i % 2 === 0) {
        ctx.beginPath();
          ctx.moveTo(centerVanishingPoint.x, centerVanishingPoint.y);
          let [x,y] = rotate(
            centerVanishingPoint.x,
            centerVanishingPoint.y,
            centerVanishingPoint.x +PRIMARY_SPHEROID_WIDTH * 2,
            centerVanishingPoint.y + 0,
              radiansArray[i]
            )
          ctx.lineTo(x,y);
          ctx.stroke(); 
          ctx.closePath()
          ctx.moveTo(centerVanishingPoint.x, centerVanishingPoint.y);
  
          [x,y] = rotate(
            centerVanishingPoint.x,
            centerVanishingPoint.y,
            centerVanishingPoint.x - PRIMARY_SPHEROID_WIDTH * 2,
            centerVanishingPoint.y + 0,
              radiansArray[i]
            )
          ctx.lineTo(x,y);
          ctx.stroke(); 
          ctx.closePath()
          ctx.moveTo(centerVanishingPoint.x, centerVanishingPoint.y);
  
          [x,y] = rotate(
            centerVanishingPoint.x,
            centerVanishingPoint.y,
            centerVanishingPoint.x - 0,
            centerVanishingPoint.y + PRIMARY_SPHEROID_HEIGHT * 2,
              radiansArray[i]
            )
          ctx.lineTo(x,y);
          ctx.stroke(); 
          ctx.closePath();
          [x,y] = rotate(
            centerVanishingPoint.x,
            centerVanishingPoint.y,
            centerVanishingPoint.x - 0,
            centerVanishingPoint.y - PRIMARY_SPHEROID_HEIGHT * 2,
              radiansArray[i]
            )
          ctx.lineTo(x,y);
          ctx.stroke(); 
          ctx.closePath()
        }
      }
    }
    makeVanishingLines();


  },
  [
    NUMBER_OF_STEPS,
    PRIMARY_SPHEROID_HEIGHT,
    PRIMARY_SPHEROID_WIDTH,
    UPPER_EXTENSIONS,
    centerVanishingPoint.x, 
    centerVanishingPoint.y, 
    primaryCircleAngle, 
    radiansArray, 
    superRotation,
    secondaryCircleAngle]);
 

  const MeasurementBand = ({label, val, handleChange, min, max}) => {
    return (
        <div>
          <p>{label} {val}</p>
          <Slider   aria-label="Temperature"
  defaultValue={val}
  valueLabelDisplay="auto"
onChangeCommitted={(e,value) => handleChange(value)}
      
  min={min}
  max={max} />
          {/* <Slider aria-label="Volume" defaultValue={val} min={min} max={max} onChange={handleChange} /> */}
        </div>
    );
  }
  const arrayOfOptions = [
    ["Number of Steps Between Major Axisis", NUMBER_OF_STEPS, updateNumberOfSteps, 1, 36],
    ["Width in Pixels of Clipping Rectangle that Crops the Curvilinear Grid", PAPER_CROPPING_WIDTH, updatePAPER_CROPPING_WIDTH, 3, 10000],
    ["Height in Pixels of Clipping Rectangle that Crops the Curvilinear Grid", PAPER_CROPPING_HEIGHT, updatePAPER_CROPPING_HEIGHT,3,10000 ],
    ["Height of Vertical Vanishing Points", PRIMARY_SPHEROID_HEIGHT, updatePRIMARY_SPHEROID_HEIGHT, 3, 10000 ],
    ["Width of Horizontal Vanishing Points", PRIMARY_SPHEROID_WIDTH, updatePRIMARY_SPHEROID_WIDTH ,3, 10000],
    ["Upper Extensions, bands past assymptote point, 1 is default", UPPER_EXTENSIONS, updateUPPER_EXTENSIONS, 1, 10 ],
    ["Horizontally nudge center vanishing point", widthNudge, updatewidthNudge, -PAPER_CROPPING_WIDTH,  PAPER_CROPPING_WIDTH],
    ["Vertically nudge center vanishing point", heightNudge, updateheightNudge, -PAPER_CROPPING_HEIGHT, PAPER_CROPPING_HEIGHT ],
    ["Rotation of Grid within Clipping Rectange", superRotation, updatesuperRotation, 0, 35 ],
  ];

  const MeasurementBar = () => arrayOfOptions.map(([label, val, handleChange, min, max], i) => {
    return (<MeasurementBand key={label} label={label} val={val} handleChange={(v)=>{handleChange(v);}} min={min} max={max} />);
  })
  // return (<div><p>hello woeld!</p></div>)
  return (
    <>
    <div className="options" style={{maxWidth: '600px'}}>
      <p onClick={() => saveImage()}>Save Image</p>
      <MeasurementBar />
    </div>
  <div style={{}}>
    <canvas 
      ref={canvasRef} 
      height={PAPER_CROPPING_HEIGHT}
      width={PAPER_CROPPING_WIDTH}
      style={{
        width: PAPER_CROPPING_WIDTH,
        height: PAPER_CROPPING_HEIGHT,
        border: '4px solid #000',
      }}/>
    </div>
    <img id="myPix" />
    </>);
}

export default MapMaker;
