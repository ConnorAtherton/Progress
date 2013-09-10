# Progress.js

Progress is an online tool that allows students to visualise and forecast academic grades

## Usage

Link progress.js file into your project

```HTML
<script src="progress.js"></script>
```

Create container for progress to load graphs into

**IMPORTANT** The container needs to have an ID so progress can find it. It also needs to have a data-user-id attribute which is the users unique identifier to retrieve data from RESTful API

```HTML
<section id="data" data-user-id="connor"></section>
```

Initalise progress by calling `progress.init()` passing in the container ID as the first argument and link to the API as the second argument

```JavaScript
progress.init("data", "path/to/RESTful/API")
```

Watch the magic happen.


## Installing the demo

Navigate into the ```demo``` directory.

Install node modules
  
	npm install

Install bower dependancies
  
    bower install

Run the server
  
    grunt server

Demo should automatically open in the browser - hack away and contribute!

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request