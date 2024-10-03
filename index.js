const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

const url = 'https://roadmap.novu.co/changelog'

app.get('/', function (req, res) {
    res.json('This is my webscraper')
})

app.get('/results', (req, res) => {
    axios(url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const posts = []

            console.log('Number of .items-start elements:', $('.items-start').length)

            $('.items-start').each(function (index) {
                const post = {}
                
                console.log(`Processing item ${index + 1}:`)
                
                post.title = $(this).find('.text-\\[26px\\]').text().trim()
                console.log('Title:', post.title)

                const anchor = $(this).find('a').first()
                post.url = anchor.length ? `https://roadmap.novu.co${anchor.attr('href')}` : null
                console.log('URL:', post.url)

                const imageSrc = $(this).find('img').attr('src')
                post.imageUrl = imageSrc ? `https://roadmap.novu.co${imageSrc}` : null
                console.log('Image URL:', post.imageUrl)

                post.content = $(this).find('.prose').text().trim()
                console.log('Content length:', post.content.length)

                // Try multiple selectors for date
                        const dateSelectors = [
            '.top-4 a.hover\\:text-primary',
            '.top-4 a',
            '.top-4',
            'time[datetime]',
            '[class*="date"]',
            '[class*="time"]'
        ];

                
                for (let selector of dateSelectors) {
                    post.date = $(this).find(selector).first().text().trim()
                    if (post.date) {
                        console.log(`Date found with selector "${selector}":`, post.date)
                        break
                    }
                }
                
                if (!post.date) {
                    console.log('Date not found with any selector')
                }

                posts.push(post)
                console.log('---')
            })

            console.log(`Total posts scraped: ${posts.length}`)
            res.json(posts)
        })
        .catch(err => {
            console.error('Error occurred while scraping:', err)
            res.status(500).json({ error: 'An error occurred while scraping the website' })
        })
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))