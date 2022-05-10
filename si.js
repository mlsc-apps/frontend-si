import fs from 'fs';
import https from 'https';
import { BodyRenderer, DivRenderer, HeadRenderer, HtmlRenderer } from './lib/defaults.js';

let defaults = {
    body : BodyRenderer,
    html : HtmlRenderer,
    div  : DivRenderer,
    head : HeadRenderer
}

export class Si {

static resolveRenderer(renderer) {
    return new Promise(function (resolve, reject) {
        if (renderer.startsWith('https://')) {
            let rendererNohttp = renderer.split('://')[1].replace('render.js', '');
            let folder = './renderers/' + rendererNohttp;
            let renderFile = folder + '/render.js';
            if (!fs.existsSync(renderFile)) {
                https.get(renderer, (res) => {
                    console.log(`Renderer ${rendererNohttp} Download Completed`);
                    fs.mkdirSync(folder, { recursive: true });
                    const filePath = fs.createWriteStream(renderFile);
                    res.pipe(filePath);
                    filePath.on('finish', () => {
                        filePath.close();
                        resolve(rendererNohttp);
                    });
                });
            } else {
                resolve(rendererNohttp);
            }
        } else {
            resolve(renderer);
        }
    });
}

static sendHTML(htmlOutput, callback) {
    // console.log("htmlOutput: ", htmlOutput);
    let response = '';
    let openTags = [];
    let previousSpaces = -1;
    for (let index = 0; index < htmlOutput.length; index++) {
        const line  = htmlOutput[index];
        if (line.length === 0) continue;
        if (line.spaces === previousSpaces) {
            let ot = openTags[0];
            if (ot.endTag) {
                response += ot.endTag;
                openTags.shift();
            }
        }

        if (line.spaces < previousSpaces) {
                let ots = openTags.filter( e => { return e.spaces >= line.spaces});
                ots.forEach( o => {
                    if (o.endTag) response += o.endTag;
                });
                openTags = openTags.filter(x => !ots.includes(x));
        }
        
        openTags.splice(0, 0, {
            spaces: line.spaces,
            endTag: line.eRender
        });

        previousSpaces = line.spaces;
        response += line.bRender;
    }
    openTags.forEach( ot => {
        response += ot.endTag;
    });

    callback(response);
}

static renderHTML(file, data, callback) {

        let htmlOutput    = [];
        let linesRendered = 0;
        let linesTotal = 0;

        let lines = fs.readFileSync(file, 'utf-8').split('\n');
        lines = lines.filter( l => l.trim().length != 0);
        linesTotal = lines.length;
        for (let index = 0; index < lines.length; index++) {
            htmlOutput.push('');
        }
        lines.forEach( async (line, lineNumber) => {

            const [rendererLine, argument] = line.split('@->');
            let spaces   = rendererLine.search(/\S/);
            let renderer = rendererLine.trimStart();

            renderer = await Si.resolveRenderer(renderer);
            if (renderer) {
                let path = `./renderers/${renderer}/render.js`;
                if (fs.existsSync(path)) {
                    let rendererBody = fs.readFileSync(path, 'utf8');
                    const rClass = eval("(" + rendererBody + ")");
                    const rObject = new rClass();

                    htmlOutput[lineNumber] = {
                        spaces,
                        bRender : rObject.beginRender(data[argument]),
                        eRender : rObject.endRender(data[argument])
                    } 
                    if (++linesRendered === linesTotal) Si.sendHTML(htmlOutput, callback);
                  } else if (renderer in defaults) {
                      // check defaults

                      const rObject = new defaults[renderer];
                      htmlOutput[lineNumber] = {
                        spaces,
                        bRender : rObject.beginRender(data[argument]),
                        eRender : rObject.endRender(data[argument])
                      }
                      if (++linesRendered === linesTotal) Si.sendHTML(htmlOutput, callback);
                  } else {
                      // renderer not found must be a line  
                        htmlOutput[lineNumber] = {
                            spaces,
                            bRender : renderer
                        }
                   
                    if (++linesRendered === linesTotal) Si.sendHTML(htmlOutput, callback);
                  }
                }
            });

        }
    }