

# Make Mixpanel Data
a quick and dirty CLI in node.js to generate fake data for mixpanel.

## tldr;

```bash
npx make-mp-data --token 1234
```
 - makes events, users, groups (sends them to your project)
 - makes lookup tables and SCD type 2 exported as CSVs

(note: if you want group analytics, add a `company_id` group key to your project before running)

## customization

```bash
npx make-mp-data [dataModel.js] [options]
```
ex.

```bash
npx make-mp-data ecommSpec.js --token 1234 --numDays 30 --numUsers 1000 --numEvents 1000000
```

see `--help` for a full list of options

see `./models/` for a few `dataModel.js`` examples

