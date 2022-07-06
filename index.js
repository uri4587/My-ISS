const BASE_URL="https://api.wheretheiss.at/v1/satellites/25544";
const init=async ()=>{
    const res= await fetch(BASE_URL)
    const data= await res.json()
    const satLong=data.longitude;
    const satLat=data.latitude;
    const satCoordinates=[satLong,satLat];
    placeRendering(polarCoordinateTranslatorFunction(satCoordinates));
    document.querySelector('.coordinates-form').addEventListener('submit',submitHandler(satLong,satLat))
}
const polarCoordinateTranslatorFunction=(coordinates)=>{
    const Rp=1;
    const longInDegrees= coordinates[0]<0 ? 180-Math.abs(coordinates[0]) : coordinates[0]
    const y=coordinates[1]/90;
    const xPosAtEquator= longInDegrees<90 ? Rp-Rp*(longInDegrees/90):-1*Rp*((longInDegrees-90)/90)
    const absXPAE=Math.abs(xPosAtEquator);
    const Rr=(Math.pow(Rp,2)+Math.pow(xPosAtEquator,2))/(2*absXPAE);
    const xDistort=coordinates[0]<90 ? Math.sqrt(Math.pow(Rr,2)-Math.pow(y,2))-Rr: Rr-Math.sqrt(Math.pow(Rr,2)-Math.pow(y,2))
    const x=xPosAtEquator+xDistort;
    const renderImage=coordinates[0]<0 ? 2 : 1
    return [x,y,renderImage];
}
const placeRendering=(arrayOfRenderData,src="src/ISS.png",imgID="iss")=>{
    const renderingImage=createElem("img",imgID,1)
    renderingImage.dataset.isTriggered="false";
    renderingImage.src=src
    renderingImage.id==="iss" ? renderingImage.addEventListener("mouseover",mouseOverHandler) : null
    renderingImage.style.left=`${241+arrayOfRenderData[0]*250}px`
    renderingImage.style.top=`${245 - arrayOfRenderData[1]*250}px`
    const targetSideOfPlanet=arrayOfRenderData[2]===1 ? document.querySelector("#planet-left") : document.querySelector("#planet-right")
    targetSideOfPlanet.append(renderingImage)
}
const distanceFromISS=(arrayForISS,arrayForUser)=>{
    const rEarth=3963.19
    const longOfISS=arrayForISS[0];
    const latOfISS=arrayForISS[1];
    const longOfUser=arrayForUser[0];
    const latOfUser=arrayForUser[1];
    const longISSRad=longOfISS*Math.PI/180
    const latISSRad=latOfISS*Math.PI/180
    const longUserRad=longOfUser*Math.PI/180
    const latUserRad=latOfUser*Math.PI/180
    // Haversin formula
    const distanceBetweenPoints=rEarth*Math.acos((Math.sin(latISSRad)*Math.sin(latUserRad))+Math.cos(latISSRad)*Math.cos(latUserRad)*Math.cos(longISSRad-longUserRad))
    console.log(`You are ${distanceBetweenPoints} miles from the ISS`);
    return distanceBetweenPoints;
}
const mouseOverHandler=(e)=>{
    e.stopPropagation();
    if(e.target.dataset.isTriggered==="false"){
        e.target.dataset.isTriggered="true";
        alert("CAREFUL! Your pointer hit the ISS! The ISS could damage your pointer moving at a speed of 17,000 miles per hour!")
    }
}
const createElem=(type,id,textContent=1)=>{
    const newElem=document.createElement(type);
    newElem.id=id;
    textContent!==1 ? newElem.textContent=textContent : null;
    return newElem
}
const submitHandler=(satLong,satLat)=>{
    return function(e){
        e.preventDefault();
        const inputCoordinatesArray = [document.querySelector('#longitude.input-text').value * document.querySelector('#polarity-EW').value , document.querySelector('#latitude').value * document.querySelector('#polarity-NS').value]
        document.querySelector('#userLocation') ? document.querySelector('#userLocation').remove():null;
        document.querySelector('#results-of-submit') ? document.querySelector('#results-of-submit').remove():null;
        const submitResultsDiv = createElem("div","results-of-submit")
        const mycoordinatesPTag = createElem("p",'my-coordinates',`Latitude: ${inputCoordinatesArray[1]} ||  Longitude: ${inputCoordinatesArray[0]}`)
        const myDistancePTag = createElem("p",'my-distance',`You are ${distanceFromISS([satLong,satLat],inputCoordinatesArray)} miles from the ISS!!!!!!`) 
        const issCoordinatesPTag =createElem("p",'ISS-coordinates',`ISS Coordinates: ${satLong}, ${satLat}`)
        document.querySelector('body').append(submitResultsDiv)
        submitResultsDiv.append(mycoordinatesPTag,myDistancePTag, issCoordinatesPTag)
        placeRendering(polarCoordinateTranslatorFunction(inputCoordinatesArray),'src/dot.png', 'userLocation')
    }   
}
document.addEventListener("DOMContentLoaded",init)

