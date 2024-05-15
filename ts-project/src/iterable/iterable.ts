function delay<T>(time: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), time));
}

interface IFile {
  name: string;
  body: string;
  size: number;
}

function getFile(name: string): Promise<IFile> {
  return delay(1500, { name, body: '...', size: 100 });
}

async function main() {
  promiseRace2();
}

main();

/**
 * Promise.race()
 * n개의 Promise를 전달했을 때 제일 먼저 완료된 Promise의 결과만 반환
 * - 사용자의 네트워크 상황에 따라 다른 응답을 줘야할 때
 */

async function promiseRace() {
  const result = await Promise.race([
    getFile('file1.png'),
    delay(4000, 'timeout'),
  ]);

  if (result === 'timeout') {
    console.log('네트워크 환경을 확인해주세요');
  } else {
    console.log(result);
  }
}

async function promiseRace2() {
  const file = getFile('file1.png');
  const result = await Promise.race([file, delay(1000, 'timeout')]);

  if (result === 'timeout') {
    console.log('Loading...');
    console.log(await file);
  } else {
    console.log('Render!!');
  }
}
