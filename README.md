

# Make Mixpanel Data
a quick and dirty CLI in node.js to generate fake data for mixpanel.

## tldr;

 
 ```bash
npx make-mp-data 
```
 - makes events + users (and writes them to CSVs)

 ```bash
npx make-mp-data --numUsers 100 --numEvents 10000 --days 90 --format json
```
 - makes ~10k events + 100 users from the last 90 days (but writes JSON)


 ```bash
npx make-mp-data --complex
```
 - makes events + users + groups + scd + lookup tables
 - this includes every type of data that mixpanel supports

```bash
npx make-mp-data --token 1234
```
 - makes events + users (and send them to mixpanel)

```bash
npx make-mp-data --help
```
- explains all the options you can specify

## customization

```bash
npx make-mp-data [dataModel.js] [options]
```
ex.

```bash
npx make-mp-data ecommSpec.js --token 1234 --numDays 30 --numUsers 1000 --numEvents 1000000
```

see `--help` for a full list of options

see `./models/` for a few `dataModel.js` examples...

