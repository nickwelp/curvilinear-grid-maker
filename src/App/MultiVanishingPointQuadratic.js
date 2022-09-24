import React, { useEffect, useRef, useState }  from "react";
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import {
  checkIntersection,
} from 'line-intersect';

const MapMaker = () => {
  const slope = ([a,b],[c,d]) => [c-a, d-b];

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
  const [PAPER_CROPPING_WIDTH, updatePAPER_CROPPING_WIDTH] = useState(1200);
  const [PAPER_CROPPING_HEIGHT, updatePAPER_CROPPING_HEIGHT ] = useState(1200);
  const [PRIMARY_SPHEROID_HEIGHT, updatePRIMARY_SPHEROID_HEIGHT ] = useState(600);
  const [PRIMARY_SPHEROID_WIDTH, updatePRIMARY_SPHEROID_WIDTH ] = useState(600);
  const [UPPER_EXTENSIONS, updateUPPER_EXTENSIONS ] = useState(1);
  const [widthNudge, updatewidthNudge ] = useState(300);
  const [heightNudge, updateheightNudge ] = useState(300);
  const [superRotation, updatesuperRotation ] = useState(0);
  const [primaryAngle, updatePrimaryAngle ] = useState(0);
  const [secondaryAngle, updatesecondaryAngle ] = useState(18);
  const [vanishingLines, updateVanishingLines] = useState(18);
  const [recedingBendingLines, updateRecedingBendingLines] = useState(11);
  const [enableVanishLines, updateEnableVanishingLines] = useState(true);
  const [enableBendingVanishLines, updateEnableBendingVanishingLines] = useState(true);
  const [spreadOfBendingVanishingLines, updateSpreadOfBendingVanishingLines] = useState(20);
  const [drawSpheroid, updateDrawSpheroid] = useState(false);

  const [showBeziers, updateShowBeziers] = useState(false);
  const [fillBackground,updateFillBackground] = useState(true);

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
    if(fillBackground){
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgb(255,255,255)';
    }

    ctx.fill();
    const makeCollapsingCircle = (rotation = 0, wN = 0, hN = 0, secondaryAngle = 0) => {
      const upper_extensions = wN === 0 && hN === 0 ? UPPER_EXTENSIONS : 1;
      const angle = wN === 0 ? -1*radiansArray[superRotation] :-1*radiansArray[superRotation] - secondaryAngle - Math.PI/2;
      const [centerWidth, centerHeight] = rotate(
        centerVanishingPoint.x,
        centerVanishingPoint.y,
        centerVanishingPoint.x + wN,
        centerVanishingPoint.y + hN,
        angle  
      );
      if(drawSpheroid){
        for(let i = 0; i<NUMBER_OF_STEPS + upper_extensions; ++i) {
          ctx.beginPath();
          ctx.ellipse(centerWidth, centerHeight, ((PRIMARY_SPHEROID_WIDTH/2)/NUMBER_OF_STEPS) * i, PRIMARY_SPHEROID_HEIGHT/2, radiansArray[superRotation] + rotation, 0, 2 * Math.PI);
          ctx.stroke();		
          ctx.closePath()
          
        }
      }
      if(!(wN === 0 && hN ===0)) makeLinesOfTangent(wN, hN);  
    }
    const midpoint = ([x1, y1], [x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2];

    const makeCollapsingCirclePerp = (rotation = 0, wN = 0, hN = 0, secondaryAngle=0) => {
      const upper_extensions = wN === 0 && hN === 0 ? UPPER_EXTENSIONS : 1;
      const angle = wN ===0 ? -1*radiansArray[superRotation] :-1*radiansArray[superRotation] - secondaryAngle - Math.PI/2;
      const [centerWidth, centerHeight] = rotate(
        centerVanishingPoint.x,
        centerVanishingPoint.y,
        centerVanishingPoint.x + wN,
        centerVanishingPoint.y + hN,
        angle
      );
      if(drawSpheroid){
        for(let i = 0; i<NUMBER_OF_STEPS + upper_extensions; ++i) {
          ctx.beginPath();
          ctx.ellipse(centerWidth, centerHeight, PRIMARY_SPHEROID_WIDTH/2, ((PRIMARY_SPHEROID_WIDTH/2)/NUMBER_OF_STEPS) * i, (radiansArray[superRotation] + rotation) + Math.PI/2, 0, 2 * Math.PI);
          ctx.stroke();		
          ctx.closePath()
        }
      }
      // makeLinesOfTangent(wN, hN);  
      // if(!(wN === 0 && hN ===0)) makeLinesOfTangent(wN, hN);  

    }
    const tangentPoints = [];
    const tangentLineEndPoints = [];
    const makeLinesOfTangent = (wN = 0, hN = 0) => {
      const angle = wN ===0 ? -1*radiansArray[superRotation] :-1*radiansArray[superRotation] - secondaryCircleAngle - Math.PI/2;
      const [reflectingSpheroidWidth, reflectingSpheroidHeight] = rotate(
        centerVanishingPoint.x,
        centerVanishingPoint.y,
        centerVanishingPoint.x + wN,
        centerVanishingPoint.y + hN,
        angle
      );
      const [pointOfTagencyX, pointOfTagencyY] = midpoint([reflectingSpheroidWidth, reflectingSpheroidHeight], [centerVanishingPoint.x, centerVanishingPoint.y]);
      const [slopeX, slopeY] = [(reflectingSpheroidWidth - centerVanishingPoint.x), (reflectingSpheroidHeight - centerVanishingPoint.y)];

      // ctx.beginPath();
      // ctx.ellipse(pointOfTagencyX, pointOfTagencyY, 10,10, 0, 0, 2 * Math.PI);
      // ctx.stroke();
      // ctx.closePath();
      let [lineToX, lineToY] = rotate(
        pointOfTagencyX,
        pointOfTagencyY,
        pointOfTagencyX - slopeX,
        pointOfTagencyY - slopeY,
        Math.PI/2
        )
      if(drawSpheroid){ 
        ctx.moveTo(pointOfTagencyX, pointOfTagencyY);
        ctx.lineTo(lineToX, lineToY);
        ctx.stroke(); 
        ctx.closePath();
      }
      tangentPoints.push([pointOfTagencyX, pointOfTagencyY]);
      tangentLineEndPoints.push([lineToX, lineToY]);

      [lineToX, lineToY] = rotate(
        pointOfTagencyX,
        pointOfTagencyY,
        pointOfTagencyX + slopeX,
        pointOfTagencyY + slopeY,
        Math.PI/2
      );
      tangentLineEndPoints.push([lineToX, lineToY]);
      if(drawSpheroid){
        ctx.moveTo(pointOfTagencyX, pointOfTagencyY);
        ctx.lineTo(lineToX, lineToY);
        ctx.stroke(); 
        ctx.closePath()
        ctx.strokeStyle = 'rgb(0,0,152)';
      }

    };

    ctx.strokeStyle = 'rgb(0,0,152)';
    // Draw the ellipse
    makeCollapsingCircle(primaryCircleAngle);
    makeCollapsingCirclePerp(secondaryCircleAngle);
    let fourCorners = [
      [PRIMARY_SPHEROID_WIDTH, 0],
      [-1 * PRIMARY_SPHEROID_WIDTH, 0],
      [0, -1 * PRIMARY_SPHEROID_HEIGHT],
      [0, PRIMARY_SPHEROID_HEIGHT]
    ]
    fourCorners.forEach(([w,h]) => {
      makeCollapsingCircle(primaryCircleAngle,w,h, secondaryCircleAngle);
      makeCollapsingCirclePerp(secondaryCircleAngle, w,h, secondaryCircleAngle);
    });
    const tangentIntersectionHashes = [];
    const tangentIntersections = tangentPoints.map(([ax,ay], i) => {
      const [ex,ey]= tangentLineEndPoints[(i*2)%tangentLineEndPoints.length];
      const [fx,fy] = tangentLineEndPoints[(i*2 + 1)%tangentLineEndPoints.length];
      const [gx,gy] = tangentLineEndPoints[(i*2+ 2)%tangentLineEndPoints.length];
      const [hx,hy] = tangentLineEndPoints[(i*2+ 3)%tangentLineEndPoints.length];
      const [ix,iy] = tangentLineEndPoints[(i*2+ 4)%tangentLineEndPoints.length];
      const [jx,jy] = tangentLineEndPoints[(i*2+ 5)%tangentLineEndPoints.length];
      const [kx,ky] = tangentLineEndPoints[(i*2+ 6)%tangentLineEndPoints.length];
      const [lx,ly] = tangentLineEndPoints[(i*2+ 7)%tangentLineEndPoints.length];
      // ctx.strokeStyle = 'rgb(255,0,255)';

      // ctx.moveTo(ex,ey);
      // ctx.lineTo(fx,fy);
      ctx.stroke();
      let ty = checkIntersection(ex,ey,fx,fy,gx,gy,hx,hy);
      if(ty.point) {
        if(!tangentIntersectionHashes.includes(JSON.stringify({x:Math.round(ty.point.x*1000), y:Math.round(1000* ty.point.y)}))){
          tangentIntersectionHashes.push(JSON.stringify({x:Math.round(ty.point.x*1000), y:Math.round(1000* ty.point.y)}));
          const {point:{x=1,y=1} = {}} = ty;
          return [x,y];
        }
      }
      ty = checkIntersection(ex,ey,fx,fy,ix,iy,jx,jy);
      if(ty.point) {
        if(!tangentIntersectionHashes.includes(JSON.stringify({x:Math.round(ty.point.x*1000), y:Math.round(1000* ty.point.y)}))){
          tangentIntersectionHashes.push(JSON.stringify({x:Math.round(ty.point.x*1000), y:Math.round(1000* ty.point.y)}));
          const {point:{x=1,y=1} = {}} = ty;
          return [x,y];
        }
      }
      ty = checkIntersection(ex,ey,fx,fy,kx,ky,lx,ly);
      if(ty.point) {
        if(!tangentIntersectionHashes.includes(JSON.stringify({x:Math.round(ty.point.x*1000), y:Math.round(1000* ty.point.y)}))){
          tangentIntersectionHashes.push(JSON.stringify({x:Math.round(ty.point.x*1000), y:Math.round(1000* ty.point.y) }));
          const {point:{x=1,y=1} = {}} = ty;
          return [x,y];
        }
      }
      ty = checkIntersection(gx,gy,hx,hy,ix,iy,jx,jy);
      if(ty.point) {
        if(!tangentIntersectionHashes.includes(JSON.stringify({x:Math.round(ty.point.x*1000), y:Math.round(1000* ty.point.y)}))){
          tangentIntersectionHashes.push(JSON.stringify({x:Math.round(ty.point.x*1000), y:Math.round(1000* ty.point.y)}));
          const {point:{x=1,y=1} = {}} = ty;
          return [x,y];
        }
      }
      return null;
    });
    if(showBeziers) tangentPoints.forEach(([x1,y1],i) => {
      if (tangentIntersections.length) {
        let x = x1;
        let y = y1;
        let a = i + 1;
        if(i===0 || i===3 ) a = i + 2;
        if(i===2) { 
          a = i + 1;
          [x,y] = tangentPoints[(i+2)%tangentPoints.length];
        }
        ctx.strokeStyle = 'rgb(0,0,152)';
        if(tangentIntersections[i%tangentIntersections.length]){
          const [c1x,c1y] =tangentIntersections[i%tangentIntersections.length];
          ctx.closePath();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.bezierCurveTo(
            c1x,c1y,
            c1x,c1y,
            tangentPoints[((a)%tangentPoints.length)][0], 
            tangentPoints[((a)%tangentPoints.length)][1]
          );
          ctx.stroke();
          ctx.closePath();
          ctx.beginPath();

          ctx.moveTo(x, y);
          ctx.bezierCurveTo(
            x,y,
            c1x,c1y,

            tangentPoints[((a)%tangentPoints.length)][0], 
            tangentPoints[((a)%tangentPoints.length)][1]
          );
          
          ctx.stroke();      
          ctx.closePath();

          const [a1x, a1y] = midpoint([c1x, c1y], [x,y]);
          const [a2x, a2y] = midpoint([a1x, a1y], [c1x,c1y]);
          const [a3x, a3y] = midpoint([a1x, a1y], [x,y]);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.bezierCurveTo(
            a1x,a1y,
            c1x,c1y,
            tangentPoints[((a)%tangentPoints.length)][0], 
            tangentPoints[((a)%tangentPoints.length)][1]
          );
          ctx.stroke();   
          ctx.closePath();
          ctx.beginPath();
          
          ctx.moveTo(x, y);
          
          ctx.bezierCurveTo(
            a2x,a2y,
            c1x,c1y,
            tangentPoints[((a)%tangentPoints.length)][0], 
            tangentPoints[((a)%tangentPoints.length)][1]
          );
          ctx.stroke();   
          ctx.closePath();

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.bezierCurveTo(
            a3x,a3y,
            c1x,c1y,
            tangentPoints[((a)%tangentPoints.length)][0], 
            tangentPoints[((a)%tangentPoints.length)][1]
          );
          ctx.stroke();   
          ctx.closePath();          
        }
      }
    });
    const makeBendingVanishingLines = (a = 7) => {
      ctx.strokeStyle = 'rgb(0,0,152)';
      if(tangentIntersections.length===0) return;
      fourCorners.forEach(([x1,y1], ii) => {
        if(ii===2 || ii === 0){
        let xt = x1 + centerVanishingPoint.x;
        let yt = y1 + centerVanishingPoint.y;
        let c = ii%tangentIntersections.length;

        //   let a = i + 1;
        if(ii===0){
          c = 1;
        }
        if(ii===3){
          c = 3; //3
        }
        if(ii===1){
          c = 4; //2
        }
        if(ii===2){
          c = 2; //4
        }
        
      
        if(tangentIntersections.length>0 &&  tangentIntersections[(c)%tangentIntersections.length]){
        // tangentIntersections[(c % tangentIntersections.length)]
        const [c1x, c1y] = tangentIntersections[(c)%tangentIntersections.length];  
        const [c2x, c2y] = tangentIntersections[(ii+3)%tangentIntersections.length];  
        const slopes = {
          c1: slope([c1x,c1y], [tangentPoints[((c)%tangentPoints.length)][0],tangentPoints[((c)%tangentPoints.length)][1]  ] ),
          c2: slope([c2x, c2y], [tangentPoints[((c)%tangentPoints.length)][0],tangentPoints[((c)%tangentPoints.length)][1]  ] )
        };
       

        const [xC,yC] = rotate(
          centerVanishingPoint.x,
          centerVanishingPoint.y,
          xt,
          yt,
          -1 * radiansArray[superRotation]
          )

        const [xD,yD] = rotate(
          centerVanishingPoint.x,
          centerVanishingPoint.y,
          xt,
          yt,
          (-1 * radiansArray[superRotation]) 
          )
        
        ctx.beginPath();
        ctx.ellipse(xD,yD, 9,15,0 , 0 , Math.PI*2);
        ctx.stroke();
        ctx.closePath();
        console.log("outermostBezierControlCoordinates", slopes)
        for(let i = 0; i < a; i++) {
          if(tangentIntersections){
          if(tangentIntersections.length && tangentIntersections[i*2%tangentIntersections.length]){

            if(
              true
            ){
              
           

              const con = 12/8;
            
            ctx.beginPath();
            const [merx, mery] = rotate(centerVanishingPoint.x, centerVanishingPoint.y, xC, yC, Math.PI);
            ctx.moveTo(merx, mery);
            const [mx,my] = [centerVanishingPoint.x,centerVanishingPoint.y]; //midpoint([centerVanishingPoint.x,centerVanishingPoint.y],[xC,yC]);
            const [hx,hy] = [centerVanishingPoint.x,centerVanishingPoint.y]; // midpoint([centerVanishingPoint.x,centerVanishingPoint.y],[xD,yD]);
            ctx.quadraticCurveTo(
              // mx - (2*i*slopes.c1[0]/(a)),
              // my - 2*i*slopes.c1[1]/(a),
              mx + (spreadOfBendingVanishingLines/10)*con*i*slopes.c2[0]/(a+2),
              my + (spreadOfBendingVanishingLines/10)*con*i*slopes.c2[1]/(a+2),
              xC,
              yC
            );
            ctx.stroke();
            ctx.closePath()
            
            const [horx, hory] = rotate(centerVanishingPoint.x, centerVanishingPoint.y, xD, yD, Math.PI);
            ctx.beginPath()
            ctx.moveTo(horx, hory);
            ctx.quadraticCurveTo(
              hx - (spreadOfBendingVanishingLines/10)*con*i*slopes.c2[0]/(a+2),
              hy - (spreadOfBendingVanishingLines/10)*con*i*slopes.c2[1]/(a+2),
              xD,yD);
            // ctx.lineTo(c2x,c2y);
            ctx.stroke(); 
            ctx.closePath()
            ctx.beginPath()
            
            ctx.closePath();  
            ctx.strokeStyle = 'rgb(0,0,152)';

            ctx.moveTo(centerVanishingPoint.x, centerVanishingPoint.y);
    
            }
          }
        }
      }
      }
    }
      });
    }

    const makeVanishingLines = (a = 18) => {
      ctx.strokeStyle = 'rgb(0,0,152)';

      for(let i = 0; i < a; i++) {
        if( i % 1 === 0) {
        ctx.beginPath();
          ctx.moveTo(centerVanishingPoint.x, centerVanishingPoint.y);
          let [x,y] = rotate(
            centerVanishingPoint.x,
            centerVanishingPoint.y,
            centerVanishingPoint.x +PRIMARY_SPHEROID_WIDTH * 10,
            centerVanishingPoint.y + 0,
            i*Math.PI/a
            )
          ctx.lineTo(x,y);
          ctx.stroke(); 
          ctx.closePath()
          ctx.moveTo(centerVanishingPoint.x, centerVanishingPoint.y);
  
          [x,y] = rotate(
            centerVanishingPoint.x,
            centerVanishingPoint.y,
            centerVanishingPoint.x - PRIMARY_SPHEROID_WIDTH * 10,
            centerVanishingPoint.y + 0,
            i*Math.PI/a
            )
          ctx.lineTo(x,y);
          ctx.stroke(); 
          ctx.closePath()
          ctx.moveTo(centerVanishingPoint.x, centerVanishingPoint.y);
        }
      }
    }
    if(enableVanishLines) makeVanishingLines(vanishingLines);
    if(enableBendingVanishLines) makeBendingVanishingLines(recedingBendingLines);
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
          <p style={{fontSize: 'small'}}>{label}: {val}</p>
          <Slider 
            aria-label="Temperature"
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
    ["Number of Receding Lines", vanishingLines, updateVanishingLines, 0, 100 ],
    ["Number of Bending Receding Lines", recedingBendingLines, updateRecedingBendingLines, 0, 100 ],
    ["Width in Pixels of Clipping Rectangle that Crops the Curvilinear Grid", PAPER_CROPPING_WIDTH, updatePAPER_CROPPING_WIDTH, 3, 10000],
    ["Width of Horizontal Vanishing Points", PRIMARY_SPHEROID_WIDTH, updatePRIMARY_SPHEROID_WIDTH ,3, 10000],
    ["Height in Pixels of Clipping Rectangle that Crops the Curvilinear Grid", PAPER_CROPPING_HEIGHT, updatePAPER_CROPPING_HEIGHT,3,10000 ],
    ["Height of Vertical Vanishing Points", PRIMARY_SPHEROID_HEIGHT, updatePRIMARY_SPHEROID_HEIGHT, 3, 10000 ],
    ["Upper Extensions, bands past assymptote point, 1 is default", UPPER_EXTENSIONS, updateUPPER_EXTENSIONS, 1, 100 ],
    ["Horizontally nudge center vanishing point", widthNudge, updatewidthNudge, -PAPER_CROPPING_WIDTH,  PAPER_CROPPING_WIDTH],
    ["Vertically nudge center vanishing point", heightNudge, updateheightNudge, -PAPER_CROPPING_HEIGHT, PAPER_CROPPING_HEIGHT ],
    ["Rotation of Grid within Clipping Rectange, 36/PI multiplied by this number", superRotation, updatesuperRotation, 0, 35 ],
    ["Rotation of the Horizontal Plane in relation to Vertical Plane", secondaryAngle, updatesecondaryAngle, 0,36],
    ["Spread of Bending Receding Lines", spreadOfBendingVanishingLines, updateSpreadOfBendingVanishingLines, 0,100]

  ];

  const MeasurementBar = () => arrayOfOptions.map(([label, val, handleChange, min, max], i) => {
    return (<MeasurementBand key={label} label={label} val={val} handleChange={(v)=>{handleChange(v);}} min={min} max={max} />);
  })
  // return (<div><p>hello woeld!</p></div>)
  return (<>
      <div className="options" style={{ maxWidth: '400px', right: '10px', border: '1px dashed #000', background: 'rgba(255,255,255,.7)', position: 'absolute' }}>
        <p style={{ background: 'blue', color: 'white', fontWeight: 'bold', cursor: 'pointer', padding: '5px', margin: '10px auto', width: '200px' }} onClick={() => saveImage()}>Save Image</p>
        <MeasurementBar />
        <label>Enable Receding Lines <input type="checkbox" value={enableVanishLines} checked={enableVanishLines} onClick={() => updateEnableVanishingLines(!enableVanishLines)}></input></label><br />
        <label>Enable Bending Receding Lines <input type="checkbox" value={enableBendingVanishLines} checked={enableBendingVanishLines} onClick={() => updateEnableBendingVanishingLines(!enableBendingVanishLines)}></input></label><br />
        <label>Show Spheroid <input type="checkbox" value={drawSpheroid} checked={drawSpheroid} onClick={() => updateDrawSpheroid(!drawSpheroid)}></input></label><br />
        <label>Show Bezier Outer Curves<input type="checkbox" value={showBeziers} checked={showBeziers} onClick={() => updateShowBeziers(!showBeziers)}></input></label><br/>
        <label>Render background white rather than transparent when saving the image:<input type="checkbox" value={fillBackground} checked={fillBackground} onClick={() => updateFillBackground(!fillBackground)}></input></label><br/>

      </div>
      <Box
      sx={{
        width: PAPER_CROPPING_WIDTH+4,
        height: PAPER_CROPPING_HEIGHT+4,
        backgroundColor: '#FFFFFF',
        margin: "3px",  
      }}
    >
      <div style={{}}>
        <canvas
          ref={canvasRef}
          height={PAPER_CROPPING_HEIGHT}
          width={PAPER_CROPPING_WIDTH}
          style={{
            width: PAPER_CROPPING_WIDTH,
            height: PAPER_CROPPING_HEIGHT,
            border: '4px solid #000',
          }} />
        
      </div>
      </Box>
      <img id="myPix" />
    </>);
}

export default MapMaker;
