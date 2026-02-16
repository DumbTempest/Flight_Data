

type MapButtonProps = {
    mapStyle: string;
    setMapStyle: (style: string) => void;
}

export default function MapButton({ mapStyle, setMapStyle }: MapButtonProps) {

    
    return (

       
            <select
                title="switch map style"
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value)}
                className="bg-white border rounded-md text-black  outline-none p-2"
            >
                <option value="streets">Streets</option>
                <option value="dark">Dark</option>
                <option value="satellite">Satellite</option>
                <option value="hybrid">Hybrid</option>
                <option value="topo">Topographic</option>
            </select>
  

    );
}