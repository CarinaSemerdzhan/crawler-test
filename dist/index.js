import Crawler from 'crawler';
import jsdom from 'jsdom';
import { getStyles } from './get_styles.js';
import { getTexts } from './get_text.js';
import { getImages, getLogos } from "./get_images.js";

const { JSDOM } = jsdom;
const c = new Crawler({
    callback: async (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            const dom = new JSDOM(res.body, { resources: "usable" });
            const window = dom.window;
            const document = dom.window.document;

            const { mainFont, mainColor } = await getStyles(document, res.request.uri);
            const texts = getTexts(window, document);
            const images = await getImages(window, document, res.request.uri);
            const logos = await getLogos(document, res.request.uri);

            console.log('URI: ', res.request.uri);
            console.log('----------------------------------');
            console.log('Main Font: ', mainFont);
            console.log('----------------------------------');
            console.log('Main Color: ', mainColor);
            console.log('----------------------------------');
            console.log('Texts: ', texts);
            console.log('----------------------------------');
            console.log('Images: ', images);
            console.log('----------------------------------');
            console.log('Logos: ', logos)
            console.log('----------------------------------');
        }
        done();
    }
});



// Queue just one URL, with default callback
c.queue('https://lufthansagroup.careers/de/pilot-in?mtm_campaign=lhg_piloten_plista_storyad&dclid=CP2T8vzLk4IDFWLwEQgd4qkHQQ');
c.queue('https://praemienrechner.atupri.ch/?utm_source=programmatic&utm_medium=display&utm_campaign=heg2023&utm_content=zuerich&gclid=EAIaIQobChMIkNPn9suTggMViBFVCB1Z2gIUEAEYASAAEgJP-PD_BwE');
c.queue('https://www.axa.ch/de/privatkunden/angebote/recht-cyber/rechtsschutzversicherung/rechtsberatung.html?utm_source=adexchange&dclid=CM7xsp_Mk4IDFb7luwgd93IIIQ');
c.queue('https://www.newhome.ch/de/kaufen/immobilien/haus/reihenhaus/ort-elgg/5.5-zimmer/detail/5402749?propertyType=1&offerType=1&location=1;2773&skipCount=0&rowCount=20&propertySubtypes=109&utm_source=SM_booster&utm_medium=native&utm_campaign=markstein_elgg_5.5_zimmer');
c.queue('https://www.spar.ch/aktuelles/angebote#/');
c.queue('https://www.zuerich.com/de/zuerichcard?utm_source=dv360&utm_campaign=produktkampagne_per_23&utm_medium=display&utm_content=567329698');
c.queue('https://www.swica.ch/de/kampagnen/swchtop/benevita?utm_campaign=Benefit&utm_source=Goldbach-NativeAd&utm_medium=hav20b-bene-bopr&dclid=CPiCgs_Mk4IDFQ2VdwoddH8A8w#stern01');
c.queue('https://autoshow.ch/');
c.queue('https://www.aligro.ch/de/aktionen/');
