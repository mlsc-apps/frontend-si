export class BodyRenderer {
    
    beginRender(data) {
        return '<body>';
    }

    endRender(data) {
        return '</body>';
    }
}

export class DivRenderer {

    beginRender(data) {
        return `<div>` + (data || '');
    }

    endRender(data) {
        return '</div>';
    }
}

export class HeadRenderer {
    
    beginRender(data) {
        return '<head>';
    }

    endRender(data) {
        return '</head>';
    }
}

export class HtmlRenderer {

    beginRender(data) {
        return '<html>';
    }

    endRender(data) {
        return '</html>';
    }
}