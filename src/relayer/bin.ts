// tslint:disable:no-console
import { generateTestSuite, TestSuite } from './lib'
import { generateRealisticTestSuite } from './realistic'
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

async function main() {
  if (process.argv.length === 2) {
    const testSuite = await generateTestSuite()
    writeScoutConfig(testSuite)
  } else if (process.argv.length == 4 && process.argv[2] === 'realistic') {
    const rpcData = JSON.parse(fs.readFileSync(process.argv[3]))
    const testSuite = await generateRealisticTestSuite(rpcData)
    writeScoutConfig(testSuite, 'turboproof-realistic.yaml')
  } else {
    throw new Error('Invalid arguments')
  }
}

function writeScoutConfig(data: TestSuite, outFile: string = 'turboproof.yaml') {
  const testSuite = {
    beacon_state: {
      execution_scripts: ['build/main_with_keccak.wasm'],
    },
    shard_pre_state: {
      exec_env_states: [data.preStateRoot.toString('hex')],
    },
    shard_blocks: [{ env: 0, data: data.blockData.toString('hex') }],
    shard_post_state: {
      exec_env_states: [data.postStateRoot.toString('hex')],
    },
  }

  const serializedTestSuite = yaml.safeDump(testSuite)
  fs.writeFileSync(outFile, serializedTestSuite)
}

main()
  .then(() => {})
  .catch((e: Error) => console.log(e))
