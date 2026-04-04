
# Make Mixpanel Data

## 🤖 What is this?

Generate fake Mixpanel data _quickly_ and _easily_ with a simple CLI in Node.js. **Create events, user profiles, groups profiles, SCD data, mirror tables, and lookup tables**; basically everything you need for testing + demoing mixpanel analysis features. 

the CLI looks like this:

![Generate Mixpanel data](https://aktunes.neocities.org/makeDataDemo.gif)

under the hood, `make-mp-data` is modeling data adherent to match [Mixpanel's data model](https://docs.mixpanel.com/docs/data-structure/concepts), giving you the tools you need for robust, realistic field ready test data.

## 🚀 Quick Start

### Basic Usage

Generate events and users, and write them to CSV files:

```bash
npx make-mp-data 
```

### Customizing Output

Generate 10,000 events and 100 users over the last 90 days, and write the output as JSON:

```bash
npx make-mp-data --numUsers 100 --numEvents 10000 --numDays 90 --format json
```

### Complex Data Models

Create a comprehensive dataset including events, users, groups, SCD, and lookup tables:

```bash
npx make-mp-data --complex
```

### Send Data to Mixpanel

Generate and send data directly to Mixpanel using your project token:

```bash
npx make-mp-data --token 1234
```

### Help and Options

Need more info on available options?

```bash
npx make-mp-data --help
```

## 🔧 Schema

To choose your own event and property names and values, specify a custom data model and additional options:

```bash
npx make-mp-data [dataModel.js] [options]
```

Example:

```bash
npx make-mp-data myDataSpec.js --token 1234 --numDays 30 --numUsers 1000 --numEvents 1000000
```
where `myDataSpec.js` exports a [JS object of this shape](https://github.com/ak--47/make-mp-data/blob/main/types.d.ts#L8) ... (see [`./schemas`](https://github.com/ak--47/make-mp-data/tree/main/schemas) for examples)

### Data Models

Check out `./schemas/` for example `dataModel.js` files to get started quickly.

## 🛠️ CLI Options

Here's a breakdown of the CLI options you can use with `make-mp-data`:

- `--numUsers`: Number of users to generate.
- `--numEvents`: Number of events to generate.
- `--numDays`: Number of days over which to spread the generated data.
- `--format`: Output format (`csv` or `json`).
- `--token`: Mixpanel project token for direct data import.
- `--region`: Mixpanel data region (`US`, `EU`).
- `--writeToDisk`: Whether to write the data to disk (`true` or `false`).
- `--verbose`: Enable verbose logging.
- `--complex`: create a complex set models including groups, SCD, and lookup tables.
- `--simple`: create a simple dataset including events, and users

## 🎯 Hooks — Engineering Trends in Data

Hooks let you engineer deliberate, discoverable patterns into your generated data — things like "premium users convert 2x better" or "there was a service outage during days 40-47." A hook is a single transform function on your dungeon config:

```javascript
const config = {
  // ...events, funnels, etc.
  hook: function(record, type, meta) {
    // Modify events based on type
    if (type === "event" && record.event === "purchase") {
      record.amount = record.amount * 2; // boost purchase amounts
    }
    
    // Use "everything" to correlate across a user's full event stream
    if (type === "everything") {
      const hasPurchase = record.some(e => e.event === "purchase");
      for (const event of record) {
        event.is_buyer = hasPurchase; // tag all events for this user
      }
      return record;
    }
    
    return record;
  }
};
```

Hook types: `event`, `user`, `everything`, `funnel-pre`, `funnel-post`, `scd-pre`, `ad-spend`, `group`, `mirror`, `lookup`.

See `dungeons/harness/` for comprehensive examples with 8 hooks each across gaming, fintech, education, food delivery, media, social, and SaaS verticals.

## 📄 Examples

Check out the examples directory for sample data models:

```bash
ls ./schemas/
```

These models provide a great starting point for creating your own custom data generation scripts.

## 🤝 Contributing

Feel free to fork this repository and submit pull requests. Contributions are always welcome!

For any issues or feature requests, please create an issue on the [GitHub repository](https://github.com/ak--47/make-mp-data/issues).
