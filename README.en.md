# Flickr Inspector

🔗 [README.md](https://github.com/Kyabc/flickr-inspector/blob/main/README.md)

Flickr Inspector is a browser-based application for quickly inspecting and visualizing photo data retrieved from the Flickr API.

Select one or more JSON Lines files to inspect post counts, duplicates, dates, tags, and locations. Files are processed locally in the browser and are not uploaded to an external server.

## Features

- Load multiple JSON Lines files
- Show post counts for each file as a list and chart
- Count total and unique posts
- Count unique owners
- Detect duplicate photo IDs
- Detect lines that are not valid JSON
- Calculate the percentage of posts with locations or tags
- Show monthly and yearly post counts
- Show post counts by weekday and hour
- Show frequent tags
- Show post locations as a heatmap or points
- Change the time zone used for upload-date aggregation
- Switch between upload date and date taken
- Switch the interface between Japanese and English
- Export results as a standalone HTML report

## Supported Files

The following file extensions are supported:

- `.jsonl`
- `.ndjson`
- `.jsonlines`

Files are expected to use UTF-8 encoding.

Each line must contain a JSON object representing one post. Do not wrap the file in a JSON array, and do not place commas between lines.

```jsonl
{"id":"49305147722","owner":"12345678@N00","owner_name":"example","date_upload":"1577804437","date_taken":"2020-01-01 12:30:00","lat":"35.681750","lon":"139.764388","tags":"tokyo station"}
{"id":"49304609773","owner":"12345678@N00","owner_name":"example","date_upload":"1577806629","date_taken":"2020-01-01 13:00:00","lat":"35.658305","lon":"139.703111","tags":""}
```

## Recognized Fields

Flickr Inspector uses the following keys when they are present:

- `id`: Unique-post counting and duplicate detection
- `owner`: Unique-owner counting
- `owner_name`: Used for unique-owner counting when `owner` is unavailable
- `date_upload`: Date range and monthly, weekday, and hourly aggregation by upload date
- `date_taken`: Date range and monthly, weekday, and hourly aggregation by date taken
- `lat`: Latitude of the post location
- `lon`: Longitude of the post location
- `tags`: Tag availability and frequent-tag aggregation

None of these keys is mandatory. If a field was not requested through the Flickr API `extras` parameter, the related result is shown as not retrieved.

For unique-owner counting, `owner` is preferred. If `owner` is unavailable but `owner_name` is present, `owner_name` is used instead.

## Date Handling

### Upload Date

`date_upload` is interpreted as a Unix timestamp in seconds, provided as either a string or number.

```json
{
  "date_upload": "1577804437"
}
```

The selected time zone is applied to date ranges and monthly, weekday, and hourly aggregation based on upload date.

### Date Taken

`date_taken` is expected to use a format similar to the following:

```json
{
  "date_taken": "2020-01-01 12:30:00"
}
```

If the value does not contain time-zone information, Flickr Inspector uses the recorded date and time as written.

## Map

Posts with valid location data are grouped into cells before being displayed on the map.

Available cell sizes are:

- Approximately 30 m
- Approximately 50 m
- Approximately 100 m
- Approximately 200 m
- Approximately 500 m

These distances are approximate values around Tokyo. The actual east-to-west distance represented by a longitude difference changes with latitude.

A maximum number of displayed points can be configured. When the number of cells exceeds the limit, cells with more posts are displayed first. An internet connection is required to load the background map.

## HTML Reports

The current inspection results can be exported as a standalone HTML file.

The report includes:

- Overview
- Date range
- Monthly post counts
- Frequent tags
- Counts by file
- Selected time basis
- Selected time zone

The map and source post data are not embedded in the report. The report language follows the Japanese or English language selected when the report is saved.

---

## Build
### Requirements

- Node.js 22 or later
- npm

The project primarily uses Nuxt 4, Vue 3, TypeScript, Chart.js, Leaflet, and Leaflet.heat.

## Setup

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/flickr-inspector.git
cd flickr-inspector
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application is normally available at:

```text
http://localhost:3000/
```

---

## Notes and Limitations

- Large files may take time to process depending on the device and browser.
- Displaying more map points may make map rendering slower.
- Flickr Inspector does not guarantee the accuracy or completeness of input data.
- Verify results against the source data and collection conditions before using them in research.
- Review the Flickr and Flickr API terms before using the application.

## AI Development Disclosure

This project was developed with AI assistance.

Developed with M365 Copilot, based on the GPT-5 reasoning model.

Generated code and documentation may contain errors. Review the content and test the application before use.
