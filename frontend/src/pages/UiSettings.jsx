import NewsSetting from "../pages/NewsSetting.jsx";
import SliderSetting from "../pages/SliderSetting.jsx"; 
import AthleteSetting from "./AthleteSetting.jsx";
import ClubSetting from "./ClubSetting.jsx";



export default function UiSettings() {
    return (    
         <div className="space-y-12">
            <NewsSetting/>
            <SliderSetting/>
            <AthleteSetting/>
            <ClubSetting/>
        </div>
    )
}