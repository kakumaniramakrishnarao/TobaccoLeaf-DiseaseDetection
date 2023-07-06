let model = null;

async function loadModel(){
    model = await tf.loadLayersModel("./assests/model/model.json");
}

loadModel();

const labels = {
    0: "Aphid infestation",
    1: "Brown spot",
    2: "Frog eye leaf spot",
    3: "Tobacco mosaic virus (TMV)",
    4: "Tobacco leaf curl disease",
    5: "Healthy leafs"
}

function getViewWidthHeight(vWidth, vHeight) {

    let factor=15

    let nWidth = 0,
        nHeight = 0,
        widthRem = 0,
        heightRem = 0;

    if (vWidth < vHeight) {
        let rem = vWidth * (factor / 100);
        widthRem = rem / 2;
        nWidth = vWidth - rem;
        nHeight = nWidth;
        heightRem = (vHeight - nHeight) / 2;
    } else {
        let rem = vHeight * (factor / 100);
        heightRem = rem / 2;
        nHeight = vHeight - rem;
        nWidth = nHeight;
        widthRem = (vWidth - nWidth) / 2;
    }

    return [nWidth, nHeight, widthRem, heightRem];
}


const video = document.getElementById('camera-video');
const box = document.getElementById('box-view');
const result=document.getElementById('result-cont')


navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width:  window.innerHeight , height:  window.innerWidth  } })
    .then(stream => video.srcObject = stream);


function positonBox() {
    const videoPos = video.getBoundingClientRect();
    let [nWidth, nHeight, widthGap, heightGap] = getViewWidthHeight(videoPos.width, videoPos.height);
    box.style.display = 'unset';
    box.style.width = `${nWidth}px`;
    box.style.height = `${nHeight}px`;
    box.style.top = `${heightGap + videoPos.y}px`;
    box.style.left = `${widthGap + videoPos.x}px`;
}

video.addEventListener('loadeddata', positonBox);
window.addEventListener('resize', positonBox);


function clickPicture() {
    const image=new Image();
    const canvas = document.createElement('canvas');
    const [width, height, x, y] = getViewWidthHeight(video.videoWidth, video.videoHeight);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, x, y, width, height, 0, 0, width, height);
    // image.src = canvas.toDataURL();
    return canvas.toDataURL()
}



function imgResultDiseases(data){
    document.querySelector('.cont-disease').textContent=PostData[data].name
    document.querySelector('.img-ref').href=PostData[data].imageUrl
    document.querySelector('.shoplink-ref').href=PostData[data].productLink
    document.querySelector('.cont-disease').style.color='red'
    document.querySelector('.cont-fertilizers').style.display='block'
    document.querySelector('.cont-fertilizers').textContent=PostData[data].fertilizers
    document.querySelector('.cont-causes').textContent=PostData[data].causes   
    document.querySelector('.p-fertilizers').style.display='block'
    document.querySelector('.p-causes').style.display='inherit'
    document.querySelector('.links-fertilizers').style.display='inherit'
}
function imgResultHealthy(data){
    document.querySelector('.cont-disease').textContent=PostData[data].name
    document.querySelector('.cont-disease').style.color='#32cd32'
    document.querySelector('.cont-fertilizers').style.display='none'
}

function forResult(imgData){
    document.getElementById('result-img').src=imgData
    result.style.display='unset'
    result.classList.add('resultUpAnimiation')

    document.querySelector('.p-fertilizers').style.display='none'
    document.querySelector('.p-causes').style.display='none'
    document.querySelector('.links-fertilizers').style.display='none'

    document.getElementById('result-img').onload=function(){
        predictClass(document.getElementById('result-img'))
        .then(data => {
            if(data === 5){
                imgResultHealthy(data)
            }
            else{
                imgResultDiseases(data)
            }
            })
    }
}


document.getElementById('click').addEventListener('click',function () {
    forResult(clickPicture())
})

document.getElementById('closedown').addEventListener('click',function(){
    result.classList.remove('resultUpAnimiation')
    result.classList.add('closingdownAnimation')
    setTimeout(function(){
        result.style.display='none'
        result.classList.remove('closingdownAnimation')
    },240)
})

document.getElementById('info-outline').addEventListener('click',function(){
    document.getElementById('info-cont').classList.add('infoTopAnim')
    document.getElementById('info-cont__outer').style.display='unset'
})
document.getElementById('info__closedown').addEventListener('click',function () {
    document.getElementById('info-cont').classList.remove('infoTopAnim')
    document.getElementById('info-cont').classList.add('infoDownAnim')

    setTimeout(function () {
        document.getElementById('info-cont__outer').style.display='none' 
        document.getElementById('info-cont').classList.remove('infoDownAnim')
    },140)
})

document.getElementById('file-picker').addEventListener('change',function(e){
    const r = new FileReader();
    r.readAsDataURL(e.target.files[0])
    r.onload = function () {
        forResult(r.result);
    }
})

async function predictClass(imageTag){
    const pixel = await tf.browser.fromPixels(imageTag)
    const resized = await tf.image.resizeBilinear(pixel,[400,400])
                                    .toFloat()
                                    .div(tf.scalar(255.0))
                                    .expandDims();
    let predict = await model.predict(resized).array();
    // console.log(predict);
    const maxItem = Math.max(...predict[0]);
    const classIndex = predict[0].indexOf(maxItem);
    return classIndex;
}
