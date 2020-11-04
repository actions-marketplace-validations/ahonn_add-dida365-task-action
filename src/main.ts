import * as core from '@actions/core'
import chrome from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'

function validateInput(name: string): void {
  if (!core.getInput(name)) throw new Error(`${name} is a required input`)
}

async function run(): Promise<void> {
  try {
    validateInput('emailOrPhone')
    validateInput('password')
    validateInput('task')

    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless
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
