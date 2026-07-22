import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const siteDirectory = resolve(scriptDirectory, '..');
const sourceDirectory = process.env.MONSTER_SUN_PACKAGE
  ?? '/Users/guofeng/Documents/Playground/装修空间图/怪兽小太阳驿站最终设计成果';
const outputDirectory = join(siteDirectory, 'public/assets/img/monster-sun-station-design');

const drawings = [
  ['drawing-01', '01_方案总览/图纸01_设计总览与目录.png'],
  ['drawing-02', '02_施工图纸/正式出图/图纸02_一层家具与尺寸平面图.png'],
  ['drawing-03', '02_施工图纸/正式出图/图纸03_二层及阳台家具与尺寸平面图.png'],
  ['drawing-04', '02_施工图纸/正式出图/图纸04_沿街主立面与门头设计图.png'],
  ['drawing-05', '02_施工图纸/正式出图/图纸05_机动项目区固定桌与地台节点详图.png'],
  ['drawing-06', '02_施工图纸/正式出图/图纸06_卫生间前厅与外置台盆节点详图.png'],
  ['drawing-07', '02_施工图纸/正式出图/图纸07_一层天花与照明分区图.png'],
  ['drawing-08', '02_施工图纸/正式出图/图纸08_强弱电点位与设备回路图.png'],
  ['drawing-09', '02_施工图纸/正式出图/图纸09_品牌展厅立面与展柜节点详图.png'],
  ['drawing-10', '02_施工图纸/正式出图/图纸10_品牌前厅与日咖夜酒运营节点详图.png'],
  ['drawing-11', '02_施工图纸/正式出图/图纸11_二层办公室与阳台节点详图.png'],
  ['drawing-12', '02_施工图纸/正式出图/图纸12_材料色彩与灯具选型控制图.png'],
];

const renders = [
  ['render-cafe', '03_三维效果图/日咖夜酒区效果图.png'],
  ['render-lounge', '03_三维效果图/山野会客厅效果图.png'],
  ['render-exhibition', '03_三维效果图/品牌展厅效果图.png'],
  ['render-project-office', '03_三维效果图/机动项目区效果图.png'],
  ['render-front-hall', '03_三维效果图/品牌前厅效果图.png'],
  ['render-meeting-room', '03_三维效果图/赞助商会议室效果图.png'],
  ['render-office-street', '03_三维效果图/二楼背街侧办公室效果图.png'],
  ['render-office-balcony', '03_三维效果图/二楼阳台侧办公室效果图.png'],
  ['render-facade-arches', '03_三维效果图/沿街四个拱形小门效果图.png'],
  ['render-facade-main', '03_三维效果图/品牌正门与二楼阳台效果图.png'],
];

const convertToWebp = async (source, destination, width, quality) => {
  await sharp(source)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(destination);
};

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const [name, relativeSource] of drawings) {
  const source = join(sourceDirectory, relativeSource);
  await copyFile(source, join(outputDirectory, `${name}-full.png`));
  await convertToWebp(source, join(outputDirectory, `${name}-640.webp`), 640, 86);
  await convertToWebp(source, join(outputDirectory, `${name}-1200.webp`), 1200, 88);
}

for (const [name, relativeSource] of renders) {
  const source = join(sourceDirectory, relativeSource);
  await convertToWebp(source, join(outputDirectory, `${name}-640.webp`), 640, 78);
  await convertToWebp(source, join(outputDirectory, `${name}-1200.webp`), 1200, 81);
  await convertToWebp(source, join(outputDirectory, `${name}-1800.webp`), 1800, 83);
}

await sharp(join(sourceDirectory, '07_品牌资料/怪兽小太阳官方品牌标志.jpg'))
  .rotate()
  .resize({ width: 240, withoutEnlargement: true })
  .webp({ quality: 88, effort: 6 })
  .toFile(join(outputDirectory, 'brand-logo.webp'));

console.log(`Generated ${drawings.length} drawings and ${renders.length} renders in ${outputDirectory}`);
