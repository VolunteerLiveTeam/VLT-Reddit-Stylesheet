const imgur = require('imgur');
const BlinkDiff = require('blink-diff');
const util = require('util');

imgur.setClientId(process.env.IMGUR_CLIENT_ID);

const IMAGES = ['hot', 'link', 'text', 'sticky', 'wiki'];

Promise.all(IMAGES.map(slug => {
    const diff = new BlinkDiff({
        imageAPath: `screenshot-before-${slug}.png`,
        imageBPath: `screenshot-after-${slug}.png`,
        thresholdType: BlinkDiff.THRESHOLD_PERCENT,
        threshold: 0.01, // 1% threshold
        imageOutputPath: `screenshot-diff-${slug}.png`
    });
    return util.promisify(diff.run)();
})).then(() => {
    const urls = {};
    IMAGES.forEach(slug => urls[slug] = {before: '', after: '', diff: ''});
    return Promise.all(IMAGES.map(slug => {
        return Promise.all(['before', 'after', 'diff'].map(type => {
            return imgur.uploadFile(`screenshot-${type}-${slug}.png`)
                .then(res => {
                    urls[slug][type] = res.data.link;
                });
        }));
    })).then(() => {
        const output = `| Type | Before | After | Diff |
|------|--------|-------|------|
${Object.keys(urls).map(type => `| ${type} | ${urls[type].before} | ${type} | ${urls[type].after} | ${type} | ${urls[type].diff}`).join('\n')}
        `;
        // TODO post to github
        console.log(output);
    });
}, err => {
    console.error(`ERROR! ${err}`);
});
