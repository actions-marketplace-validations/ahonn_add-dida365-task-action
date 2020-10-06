/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as core from '@actions/core'
import puppeteer from 'puppeteer'

function validateInput(name: string): void {
  if (!core.getInput(name)) throw new Error(`${name} is a required input`)
}

async function run(): Promise<void> {
  try {
    validateInput('emailOrPhone')
    validateInput('password')
    validateInput('task')

    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        // Required for Docker version of Puppeteer
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        '--disable-dev-shm-usage'
      ]
    })
    const page = await browser.newPage()
    await page.goto('https://dida365.com/signin')

    await page.focus('#emailOrPhone')
    await page.keyboard.type(core.getInput('emailOrPhone'))

    await page.focus('#password')
    await page.keyboard.type(core.getInput('password'))

    await Promise.all([
      page.click('#app>div>div>div>section:nth-child(1)>button'),
      page.waitForNavigation({waitUntil: 'networkidle0'})
    ])

    await page.click('#add-task')
    await page.keyboard.type(core.getInput('task'))
    await Promise.all([
      page.keyboard.press('Enter'),
      page.waitForNavigation({waitUntil: 'networkidle0'})
    ])

    // await page.screenshot({path: 'example.png'})

    await browser.close()

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
