import './App.css';
import MapMaker from './App/MapMaker'
function App() {
  return (
    <div className="App">
      <header className="App-header">
      <h1>Six Point Perspective Grid Maker</h1>
      <h2>Curvilinear Grid Maker</h2>
      <div style={{maxWidth: "600px", margin: 'auto', textAlign: 'left', fontSize: '12px'}}>
        <p>This app is to help make 6 point perpesctive grids, you can save to your device.</p>
        <p>Set the width and height of the Clipping Rectangle to represent paper you'd print this grid upon. 400DPI for 11x17 is 4400x6800.</p>
        <p>Then you can manipulate the size of the primary shperoid. If you set the width and height of the Primary Spheroid to the same as the Clipping Rectangle, the boundries will be at the edge.</p>
        <p>You can tilt the primary shperoid, and add upper extensions to it. The reflection spheroids do not have upper extension manipulation.</p>
        <p>When you're done, click 'save image' to download a PNG of the defined height and width.</p>
      </div>
      </header>
      <MapMaker />
    </div>
  );
}
//4400 6800
export default App;
