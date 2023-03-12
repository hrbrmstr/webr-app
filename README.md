Almost Bare Bones WebR Starter App
================

Let’s walk through how to set up a [~minimal HTML/JS/CS + WebR-powered
“app”](https://rud.is/webr-app/) on a server you own. This will be
vanilla JS (i.e. no React/Vue/npm/bundler) you can hack on at-will.

> NOTE: WebR will not work in GitHub Pages b/c Microsoft is a horrible
> company. GitHub may eventually support the JS workers on GitHub pages,
> but it still won’t stop Microsoft from being a horrible company.

TL;DR: You can find the source to the app and track changes to it [over
on GitHub](https://github.com/hrbrmstr/webr-app/tree/batman) if you want
to jump right in.

## Getting Your Server Set Up

I’ll try to keep updating this with newer WebR releases. Current version
is 0.1.0 and you can grab that from:
<https://github.com/r-wasm/webr/releases/download/v0.1.0/webr-0.1.0.tar.gz>.

### System-Wide WebR

> You should [read this
> section](https://docs.r-wasm.org/webr/v0.1.0/serving.html) in the
> official WebR documentation before continuing.

I’m using a server-wide `/webr` directory on my `rud.is` domain so I can
use it on any page I serve.

WebR performance will suffer if it can’t use `SharedArrayBuffer`s. So, I
have these headers enabled on my `/webr` directory:

    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Embedder-Policy: require-corp

I use nginx, so that looks like:

    location ^~ /webr {
      add_header "Cross-Origin-Opener-Policy" "same-origin";
      add_header "Cross-Origin-Embedder-Policy" "require-corp";
    }

YMMV.

For good measure (and in case I move things around), I stick those
headers on my any app dir that will use WebR. I don’t use them
server-wide, though.

Also, this `Cache-Control` heading appears to help keep things under
`/webr` in the browser cache longer, and will also let any ISP or
enterprise proxies keep the files in their caches as well:

\``Cache-Control: public, max-age=604800`

and, in nginx:

    location ^~ /webr {
      add_header "Cache-Control" "public, max-age=604800";
      add_header "Cross-Origin-Opener-Policy" "same-origin";
      add_header "Cross-Origin-Embedder-Policy" "require-corp";
    }

### And They Call It a MIME. A MIME!

WebR is a [JavaScript
module](https://www.w3schools.com/js/js_modules.asp), and you need to
make sure that files with an `mjs` extension have a [MIME
type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
of `text/javascript`, or some browsers won’t be happy.

A typical way for webservers to know how to communicate this is via a
`mime.types` file. That is not true for all webservers, and I’ll add
steps for ones that use a different way to configure this. The entry
should look like this:

    text/javascript  mjs;

### Testing The WebR Set Up

You should be able to hit that path on your webserver in your browser
and see the WebR console app. If you do, you can continue. If not, leave
an issue and I can try to help you debug it, but that’s on a best-effort
basis for me.

## Installing The App

We’ll dig into the app in a bit, but you probably want to see it
working, so let’s install this ~minimal app.

My personal demo app is anchored off of `/webr-app` on my `rud.is` web
server. Here’s how to replicate it:

    # Go someplace safe
    $ cd $TMPDIR

    # Get the app bundle
    # You can also use the GH release version, just delete the README after installing it.
    $ curl -o webr-app.tgz https://rud.is/dl/webr-app.tgz

    # Expand it
    $ tar -xvzf webr-app.tgz
    x ./webr-app/
    x ./webr-app/modules/
    x ./webr-app/modules/webr-app.js
    x ./webr-app/modules/webr-helpers.js
    x ./webr-app/css/
    x ./webr-app/css/simple.min.css
    x ./webr-app/css/app.css
    x ./webr-app/main.js
    x ./webr-app/index.html

    # 🚨 GO THROUGH EACH FILE
    # 🚨 to make sure I'm not pwning you!
    # 🚨 Don't trust anything or anyone.

    # Go to the webserver root
    $ cd $PATH_TO_WEBSERVER_DOC_ROOT_PATH

    # Move the directory
    $ mv $TMPDIR/webr-app .

    # Delete the tarball (optional)
    $ rm $TMPDIR/webr-app.tgz

Hit up that path on *your* web server and you should see what you saw on
mine.

## WebR-Powered App Structure

    .
    ├── css                  # CSS (obvsly)
    │   ├── app.css          # app-specific ones
    │   └── simple.min.css   # more on this in a bit
    ├── index.html           # The main app page
    ├── main.js              # The main app JS
    └── modules              # We use ES6 JS modules
        ├── webr-app.js      # Main app module
        └── webr-helpers.js  # Some WebR JS Helpers I wrote

### Simple CSS

If you sub to [my newsletter](https://dailyfinds.hrbrmstr.dev/), you
know I play with tons of tools and frameworks. Please use what you
prefer.For folks who don’t normally do this type of stuff, I included a
copy of [Simple CSS](https://github.com/kevquirk/simple.css) b/c, well,
it is *simple* to use. Please [use this
resource](https://simplecss.org/demo) to get familiar with it if you do
continue to use it.

### JavaScript Modules

When I’m in “hack” mode (like I was for the first few days after WebR’s
launch), I revert to old, bad habits. We will not replicate those here.

We’re using [JavaScript
Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
as the project structure. We aren’t “bundling” (slurping up all app
support files into a single, minified file) since not every R person is
a JS tooling expert. We’re also not using them as they really aren’t
needed, and I like to keep things simple and as dependency-free as
possible.

In `index.html` you’ll see this line:

    <script type="module" src="./main.js"></script> 

This tells the browser to load that JS file as if it were a module. As
you read (you *did* read the MDN link, above, *right*?), modules give us
locally-scoped names/objects/features and protection from clobbering
imported names.

Our main module contains all the crunchy goodness core functionality of
our app, which does nothing more than:

- loads WebR
- Tells you how fast it loaded + instantiated
- Yanks `mtcars` from the instantiated R session (`mtcars` was the third
  “thing” I typed into R, ever, so my brain defaults to it).
- Makes an HTML table from it using D3.

It’s small enough to include here:

    import { format } from "https://cdn.skypack.dev/d3-format@3";
    import * as HelpR from './modules/webr-helpers.js'; // WebR-specific helpers
    // import * as App from './modules/webr-app.js'; // our app's functions, if it had some

    console.time('Execution Time'); // keeps on tickin'
    const timerStart = performance.now();

    import { WebR } from '/webr/webr.mjs'; // service workers == full path starting with /

    globalThis.webR = new WebR({
        WEBR_URL: "/webr/", # our system-wide WebR
        SW_URL: "/webr/"    # what ^^ said
    }); 
    await globalThis.webR.init(); 

    // WebR is ready to use. So, brag about it!

    const timerEnd = performance.now();
    console.timeEnd('Execution Time');

    document.getElementById('loading').innerText = `WebR Loaded! (${format(",.2r")((timerEnd - timerStart) / 1000)} seconds)`;

    const mtcars = await HelpR.getDataFrame(globalThis.webR, "mtcars");
    console.table(mtcars);
    HelpR.simpleDataFrameTable("#tbl", mtcars);

[`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis)
is a special JS object that lets you shove stuff into the global JS
environment. Not 100% needed, but if you want to use the same WebR
context in in other app module blocks, this is how you’d do it.

Let’s focus on the last three lines.

    const mtcars = await HelpR.getDataFrame(globalThis.webR, "mtcars");

This uses a helper function I made to get a data frame object from R in
a way more compatible for most JS and JS libraries than [the default JS
object WebR’s `toJs()` function converts all R objects
to](https://docs.r-wasm.org/webr/v0.1.0/convert-r-to-js.html).

    console.table(mtcars);

This makes a nice table in the browser’s Developer Tools console. I did
this so I could have you open up the console to see it, but I also want
you to inspect the contents of the object (just type `mtcars` and hit
enter/return) to see this nice format.

We pass in a WebR context we know will work, and then *any* R code that
will evaluate and return a data frame. It is all on you (for the moment)
to ensure the code runs and that it returns a data frame.

The last line:

    HelpR.simpleDataFrameTable("#tbl", mtcars);

calls another helper function to make the table.

### HelpR

I may eventually blather eloquently and completely about what’s in
`modules/webr-helpers.js`. For now, let me focus on just a couple
things, especially since it’s got some *sweet* [JSDoc
comments](https://jsdoc.app/).

First off, let’s talk more about those comments.

I use VS Code for ~60% of my daily ops, and used it for this project. If
you open up the project root in VS Code and select/hover over
`simpleDataFrameTable` in that last line, you’ll get some sweet
lookin’formatted help. VS Code is wired up for this (other editors/IDEs
are too), so I encourage you to make liberal use of JSDoc comments in
your own functions/modules.

Now, let’s peek behind the curtain of `getDataFrame`:

    export async function getDataFrame(ctx, rEvalCode) {
        let result = await ctx.evalR(`${rEvalCode}`);
        let output = await result.toJs();
        return (Promise.resolve(webRDataFrameToJS(output)));
    }

The `export` tells the JS environment that that function is available if
imported properly. Without the `export` the function is local to the
module.

    let result = await ctx.evalR(`${rEvalCode}`);

A proper app would use JS `try`/`catch` potential errors. There’s an
example of that in the fancy React app code [over at WebR’s
site](https://docs.r-wasm.org/webr/v0.1.0/examples.html#fully-worked-examples).
We just throw caution to the wind and evaluate whatever we’re given. In
theory, we should have R ensure it’s a data frame which we kind of can’t
do on the JS side since the next line:

    let output = await result.toJs();

will show the type as a `list` (b/c `data.frame`s are `list`s).

I’ll likely add some more helpers to a more standalone helper module,
but I suspect that corporate R will beat me to that, so I will likely
also not invest too much time on it, at least externally.

#### Await! Await! Do Tell Me (about `await`)!

Before we can talk about the last line:

    return (Promise.resolve(webRDataFrameToJS(output)));

let’s briefly talk about
[async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
ops in JS.

The JavaScript environment in your browser is single-threaded.
`async`-hronous ops let pass of code to threads to avoid blocking page
operations. These get executed “whenever”, so all you get is a vapid and
shallow promise to of code execution and potentially giving you
something back.

We explicitly use `await` for when we *really* need the code to run and,
in this case, give us something back. We can keep chaining async
function calls, but — if we need to make sure the code runs and/or we
get data back — we will eventually need to keep our promise to do so;
hence, `Promise.resolve`.

## Moar To Come

Please hit up [this terribly coded dashboard
app](https://rud.is/webr-dash/no-dplyr.html) to see some fancier use.
I’ll be converting that to modules and expanding git a bit.
