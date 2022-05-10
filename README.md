
frontend-si is fast, lightweight and minimalist frontend framework based on model view concept separating rendering from the data. Every line in template file will follow the same pattern:

*renderer*\[@->*data*\]

which will execute defined renderer after passing input data to it.

## Hello World (with nodejs/express)

1. Create template file 'hello.si' with following content

```
html
    head
    body
        div@->message
```

`html`, `head`, `body` are built-in renderers with no data passed to them. `div` is a built-in renderer to which we will pass data object called message.

2. Make sure to import frontend-si module and in your express app file

`import { Si } from 'frontend-si';`

and add following line to handle request at root:

```
app.get('/', function(req, res) {
    Si.renderHTML('./hello.si', { message : "Hello World!" }, (html) => {
        res.status(200).send(html);
    });
});
```

3. This will return following rendered html file:
    ```
    <html><head></head><body><div>Hello World!</div></body></html>
    ```


## Renderers

There are three types of renderers which will be resolved in following order:

1. Local renderers. Framework will try to resolve local renderers as first. Framework will look into special folder `renderers` and then inside render name folder for a special file called `render.js` for rendering instructions.

For example renderer with name list-1.0 will be resolved for instructions under:
`./renderers/list-1.0/render.js`

Example:

`list-1.0@->listData`

2. Remote renderers. If not resolved locally framework will check for `https://` in the name of renderer to assume this is remote renderer. Framework will download the content of remote renderer and cache it inside `renderer` folders giving it a name based on URL. Next time it will be resolved locally. Feel free to change it locally if required if you want to pull remote file again just delete the folder with remote renderer.

Example:

https://raw.githubusercontent.com/mlsc-apps/si-renderers/master/list-1.0/render.js@->listData

WARNING:

3. Built-in renderers. If not resolved locally and remotely framework will fall back to built-in renderers. This means if you are not happy with default behaviour of built-in renderers write your own local one and this will override the built-in behaviour.

## Simple remote renderers

Of course the biggest power of the framework lies in remote renderers since they can be written by experts and shared. There are couple of simplest, ready-to-go remote renderers to experiment with: https://github.com/mlsc-apps/si-renderers.

You would use them by pointing to the raw version of the file for example:
https://raw.githubusercontent.com/mlsc-apps/si-renderers/master/table-1.0/render.js@->myOwnTableData

There is a working nodejs/express example here: https://github.com/mlsc-apps/frontend-si-example

## Css

You can pass css information same as any other data. Good practise would be to add css parameter inside data object for all style related information. If you pass a style to render to use make sure to add a css link in the header section of the template where the css class is defined.

## Writing your own renderer

1. Create a folder with renderer name under special folder `renderers`.

```
.
|-> renderers
    |-> myFirstRenderer
```

2. Create a special file inside newly created folder called `render.js`

```
.
|-> renderers
    |-> myFirstRenderer
        |-> render.js
```

3. Implement render specification in the file `render.js` as follows (class name does not matter)

```
class MyFirstRenderer {
    
    beginRender(data) {
        return '';
    }

    endRender(data) {
        return '';
    }
}
```

Framework will execute methods `beginRender` and `endRender` accordingly. Data required to generate html will be provided in data object.

4. Once implemented you can use new renderer inside your templates:

`MyFirstRenderer@->data`


