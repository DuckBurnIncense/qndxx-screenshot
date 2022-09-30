import axios from 'axios';
import fs from 'fs';

// 1. 先从 `http://h5.cyol.com/special/daxuexi/daxuexiall/m.html?t=1` 获取大列表 (季列表)
// 2. 再从大列表得到小列表 (期列表) 的地址 (REGEXR关键词: `location.href='http://h5.cyol.com/special/daxuexi/daxuexiall3/index.php';`)
// 3. 从小列表获得各视频 (期) 的url (例如: `https://h5.cyol.com/special/daxuexi/dr9ja2jkc6/m.html`)
// 4. 将url结尾改成 `/images/end.jpg` (例如: `https://h5.cyol.com/special/daxuexi/dr9ja2jkc6/images/end.jpg`)
// 5. 保存, 结束

const httpGet = url => {
	return new Promise((resolve, reject) => {
		axios.get(url).then(res => {
			resolve(res);
		}).catch(err => {
			resolve(err);
			// reject用await会报错
			// reject(err);
		});
	})
}

/**
 * 获取通过location.href储存的链接列表
 * @param {String} url 请求的地址
 * @returns {Array} url列表
 */
const getLocationHrefList = async url => {
	// location.href的正则
	const locationHrefRegexp = /(?<=location\.href\=\')(http.*?)(?=\';)/gim;
	const response = await httpGet(url);
	const html = response.data || '';
	const urls = html.match(locationHrefRegexp) || [];
	return urls;
};

// 所有视频 (期) 的链接
var videos = [];
// 所有图片的下载链接
var images = [];
// 获得大列表
const bigList = await getLocationHrefList('http://h5.cyol.com/special/daxuexi/daxuexiall/m.html?t=1');
// 获取小列表
for (let i = 0; i < bigList.length; i++) {
	let u = await getLocationHrefList(bigList[i]);
	videos.push(...u);
}
// 获取图片url
for (let i = 0; i < videos.length; i++) {
	let videoUrl = videos[i];
	let imageUrl = videoUrl.substr(0, videoUrl.lastIndexOf("/")) + '/images/end.jpg';
	images.push(imageUrl);
}
// 下载
for (let i = 0; i < images.length; i++) {
	await axios({
		method: 'get',
		url: images[i],
		responseType: 'stream'
	}).then(function (response) {
		response.data.pipe(fs.createWriteStream(`./images/${i}.jpg`));
	}).catch(e => console.error(e));
}

console.log(images);