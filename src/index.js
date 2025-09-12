// require these so they get webpacked
require('./index.html');
require('./index.scss');

// require leaflets
require('./leaflet-topojson.js');
require('./leaflet-choroplethlegend.scss');
require('./leaflet-choroplethlegend.js');
require('./leaflet-layerpicker.scss');
require('./leaflet-layerpicker.js');
require('./leaflet-boxzoom.scss');
require('./leaflet-boxzoom.js');
require('./leaflet-singleclick.js');
require('./printing-leaflet-easyPrint.js');


const SITE_CONSTANTS = {
    startingLocation: "2 The Circle, Georgetown, DE 19947", // Replace with your desired default location
    ctaid: 10, // Starting state for site to start up
    // stateName: "Delaware", // The name of your state, project, or cancer registry. Commonly used with the phrase "Cancer Maps" after it, indicating the name of this website.
    // numOfCancerSites: "25", // The number of cancer sites by which data may be searched. Usually the same as the number of SEARCHOPTIONS_CANCERSITE entries.
    // numOfZones: "14", // The number of zones for your state.
    // minZonePop: "50,000", // The minimum population of a zone in your state/registry catchment area. Used in a statement describing zones.
    // maxZonePop: "150,000", // The maximum population of a zone in your state/registry catchment area. Used in a statement describing zones.
    // minTractsPerZone: "1,000", // The minimum number of census tracts forming any zone. Used in a statement describing zones.
    // maxTractsPerZone: "100,000", // The maximum number of census tracts forming any zone. Used in a statement describing zones.
    // raceList: [
    //     "non-Hispanic White",
    //     "non-Hispanic Black",
    //     "non-Hispanic Asian/Pacific Islander",
    //     "non-Hispanic American Indian/Alaska Native",
    //     "Hispanic"
    // ], // A list of the races/ethnicities by which data may be displayed. This should reflect the SEARCHOPTIONS_RACE entries.
    // reportingMinCases: "16", // The minimum number of cancer cases in a zone to be reported (i.e., suppression threshold).
    // registry: "test", //Name of registry that will be listed under “Project Team” in the About section.
    // registryLink: "https://www.google.com", //A hyperlink URL to this website's parent agency, cancer registry, etc. The URL associated with the text specified in ‘registry’ field above.
    // fundingSource: "This is supported through funding", //A statement/description of who funded the website. Displayed in the About section.
    // citationInfo: "This is where you put your citation info", //A statement/description of how this website should be cited in literature.
    // nationalCancerDataSource: "this is your national cancer data source info", //A statement/description of the national cancer data source, including data years. This should be reviewed with subsequent data updates to verify whether it needs to be updated as well (e.g., during annual data updates). An example of this statement applicable to national cancer data through 2018 is: "National incidence data come from the National Program of Cancer Registries and Surveillance, Epidemiology, and End Results SEER*Stat Database: U.S. Cancer Statistics Incidence Analytic file - 1998-2018. United States Department of Health and Human Services, Centers for Disease Control and Prevention. Released June 2021, based on the 2020 submission."
    // aboutBlurb: "This is your about blurb", //A statement/description of the website, in "What is the XXX Cancer Registry" section of the FAQ.
    // incidenceDataDate: "2016", //Last year of available incidence data. Used in one of the FAQs.
    // sociodemographicDataDateRange: "2012-2016", //Data range for ACS data used. Used in one of the FAQs.
    MAP_BBOX: [[38.5268, -74.2317], [39.8108, -75.5277]],  // [[s, w], [n, e]] Starting Location
    MIN_ZOOM: 6,
    MAX_ZOOM: 15,
};

var MAP;

// for the geocoder: our Bing API key
var BING_API_KEY = 'AqmUJHuT9QJE5A0m1Kf48g2vxBND3cJ0_jJI3jJQIv9oE11VIG9WZbhq2owRSUZK';

// Our data
var DATA_URL_CANCER = 'static/data/allCancerRatesData.csv';
var DATA_URL_DEMOGS = 'static/data/allDemographics.csv';

// Our JSON files
var DATA_URL_CTAGEOM = 'static/data/cta.json'; // zones
var DATA_URL_COUNTYGEOM = 'static/data/countybounds.json'; // counties

// These files are updated by running the python scripts
var DATA_URL_CTACITY = 'static/data/cities_by_cta.csv'; // zones
var DATA_URL_CTACOUNTY = 'static/data/counties_by_cta.csv'; // counties

var SEARCHOPTIONS_TYPE = [ // filter values for zone or county
    { value: 'Zone', label: "Zone" },
    { value: 'County', label: "County" },
]

var SEARCHOPTIONS_TIME = [  // filter values for "years" field
    { value: '05yrs', label: "5-Year: 2015-2019" },
    { value: '10yrs', label: "10-Year: 2010-2019" },
];

var SEARCHOPTIONS_CANCERSITE = [  // filter values for "cancer" field
    { value: 'AllSite', label: "All Cancer Sites" },
    { value: 'Prostate', label: "Prostate" },
    { value: 'Lung', label: "Lung and Bronchus" },
    { value: 'Breast', label: "Female Breast" },
    { value: 'CRC', label: "Colon and Rectum" },
    { value: 'Kidney', label: "Kidney and Renal Pelvis" },
    { value: 'NHL', label: "Non-Hodgkin Lymphoma" },
    { value: 'Urinary', label: "Urinary Bladder" },
    { value: 'Mela', label: "Melanoma of the Skin" },
    { value: 'Pancreas', label: "Pancreas" },
    { value: 'Leuks', label: "Leukemias" },
    { value: 'Oral', label: "Oral Cavity and Pharynx" },
    { value: 'Thyroid', label: "Thyroid" },
    { value: 'Uterine', label: "Corpus and Uterus, NOS" },
    { value: 'Liver', label: "Liver and Intrahepatic Bile Duct" },
    { value: 'Stomach', label: "Stomach" },
    { value: 'Myeloma', label: "Myeloma" },
    { value: 'Brain', label: "Brain and Other Nervous System" },
    { value: 'Larynx', label: "Larynx" },
    { value: 'Ovary', label: "Ovary" },
    { value: 'Esoph', label: "Esophagus" },
    { value: 'Cervix', label: "Cervix" },
    { value: 'HL', label: "Hodgkin Lymphoma" },
    { value: 'Testis', label: "Testis" },
];
var SEARCHOPTIONS_SEX = [  // filter values for "sex" field
    { value: 'Both', label: "All Sexes" },
    { value: 'Male', label: "Male" },
    { value: 'Female', label: "Female" },
];

var SEARCHOPTIONS_RACE = [  // field prefix for AAIR, LCI, UCI fields within the incidence row
    { value: '', label: "All Ethnicities" },
    { value: 'W', label: "Non-Hispanic White" },
    { value: 'B', label: "Non-Hispanic Black" },
    { value: 'H', label: "Hispanic" },
];


// if any of the cancer sites should apply to only one sex, you may define that here
// the left-hand side (key) here is a cancer site value from SEARCHOPTIONS_CANCERSITE
// and the right-hand side (value) is a sex value from SEARCHOPTIONS_SEX
// if a cancer is selected, that sex will be auto-selected
var CANCER_SEXES = {
    'Breast': 'Female',
    'Uterine': 'Female',
    'Ovary': 'Female',
    'Cervix': 'Female',
    'Prostate': 'Male',
    'Testis': 'Male',
};

// if your data will not have Nationwide stats, you may set either/both of these to false to turn that off
var NATIONWIDE_DEMOGRAPHICS = true;
var NATIONWIDE_INCIDENCE = true;

// colors for the incidence bar chart; these mirror the SEARCHOPTIONS_SEX options
var BARCHART_COLORS_SEX = {
    'Both': '#4f629a',       // Same as before for 'Both'
    'Female': '#7a89d7',     // Darker and slightly more purple for 'Female'
    'Male': '#8faed2',
};

// definitions for the table(s) of demographic info to show beneath the map and incidence table
// see initDemographicTables() which creates the tables in DOM during setup
// see performSearchDemographics() which fills them in with demographic data when an area is selected
// each table defintion is a title for the table, and a set of rows for the table
// each row is the demographics CSV field to use, its text label, a choice of formatting for the value, and optional tooltip_id from #tooltip_contents
// see formatFieldValue() for a list of supported format types
var DEMOGRAPHIC_TABLES = [
    {
        title: "Population & Income",
        rows: [
            { field: 'TotalPop', label: "Total Population", format: 'integer', tooltip_id: undefined },
            { field: 'PctRural', label: "% Living in Rural Area", format: 'percent', tooltip_id: 'PctRural' },
        ],
    },
    {
        title: "Race & Ethnicity",
        rows: [
            { field: 'PctMinority', label: "% Minority (other than non-Hispanic White)", format: 'percent', tooltip_id: 'PctMinority' },
            { field: 'PctHispanic', label: "% Hispanic", format: 'percent', tooltip_id: 'PctHispanic' },
            { field: 'PctBlackNH', label: "% Black (non-Hispanic)", format: 'percent', tooltip_id: 'PctBlackNH' },
        ],
    },
    {
        title: "Income",
        rows: [
            { field: 'Pct100Pov', label: "% Below Poverty", format: 'percent', tooltip_id: 'PctBelowPov' }, 
            { field: 'PctNoHealthIns', label: "% Without Health Insurance", format: 'percent', tooltip_id: 'PctNoHealthIns' },
        ],
    },
    {
        title: "Education",
        rows: [
            { field: 'PctEducBchPlus', label: "% With Bachelors Degree or Higher", format: 'percent', tooltip_id: 'PctEducBchPlus' },
            { field: 'PctEducLHS', label: "% Did Not Finish High School", format: 'percent', tooltip_id: 'PctEducLHS' },
        ],
    },
    {
        title: "Disability Status",
        rows: [
            { field: 'PctDisabled', label: "% With a Disability", format: 'percent', tooltip_id: 'PctDisabled' }, 
        ],
    }
];

// the Leaflet styles for those choropleth options defined in CHOROPLETH_OPTIONS below
// the basic style in CHOROPLETH_STYLE_NODATA forms the base style for all CTAs
// then CHOROPLETH_BORDER_DEFAULT and CHOROPLETH_BORDER_SELECTED are added to form a thicker border for selected/highlighted state
// then CHOROPLETH_STYLE_INCIDENCE and CHOROPLETH_STYLE_DEMOGRAPHIC are added to form the choropleth coloring
// see performSearchMap() which calculates scoring and uses these color ramps, to implement the choropleth behavior
var CHOROPLETH_STYLE_NODATA = { fillOpacity: 0.25, fillColor: '#cccccc', color: 'black', opacity: 0.2, weight: 1 };
var CHOROPLETH_STYLE_NODATA_CLEAR = { fillOpacity: 0, fillColor: '#cccccc', color: 'black', opacity: 0, weight: 0 };
var CHOROPLETH_BORDER_DEFAULT = { color: 'black', opacity: 1, weight: 1, fill: false };
var CHOROPLETH_BORDER_SELECTED = { color: '#293885', opacity: 1, weight: 5, fill: false };
var CHOROPLETH_BORDER_NONE = { color: null, opacity: 100, weight: 0, fill: false };

var CHOROPLETH_STYLE_INCIDENCE = {
    Q1: { fillOpacity: 0.75, fillColor: '#ffffb3', stroke: false },
    Q2: { fillOpacity: 0.75, fillColor: '#ffe066', stroke: false },
    Q3: { fillOpacity: 0.75, fillColor: '#f99e26', stroke: false },
    Q4: { fillOpacity: 0.75, fillColor: '#b36093', stroke: false },
    Q5: { fillOpacity: 0.75, fillColor: '#873d6a', stroke: false },
};

var CHOROPLETH_STYLE_DEMOGRAPHIC = {
    Q1: { fillOpacity: 0.75, fillColor: '#e6eaff', stroke: false },
    Q2: { fillOpacity: 0.75, fillColor: '#abb4e0', stroke: false },
    Q3: { fillOpacity: 0.75, fillColor: '#7683c2', stroke: false },
    Q4: { fillOpacity: 0.75, fillColor: '#4b5aa3', stroke: false },
    Q5: { fillOpacity: 0.75, fillColor: '#293885', stroke: false },
};

// options for the choropleth map (Color By)
// each option is a demographic value and label like in DEMOGRAPHIC_TABLES,
// or else the special values "AAIR" and "Cases" which will use the AAIR or Cases field from incidence data
// see also leaflet-choroplethlegend.scss where their color gradients are defined
// see formatFieldValue() for a list of supported format types
var CHOROPLETH_OPTIONS = [
    // incidence data; this should be left as-is
    { field: 'Cases', label: "Cases", format: 'integer', colorramp: CHOROPLETH_STYLE_INCIDENCE },
    { field: 'AAIR', label: "Incidence", format: 'float', colorramp: CHOROPLETH_STYLE_INCIDENCE },
    // demographic data; customize this to suit your preferences
    { field: 'TotalPop', label: "Total Population", format: 'integer', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC },
    { field: 'PctRural', label: "% Living in Rural Area", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC },
    { field: 'PctMinority', label: "% Minority (other than non-Hispanic White)", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC },
    { field: 'PctHispanic', label: "% Hispanic", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC },
    { field: 'PctBlackNH', label: "% Black (non-Hispanic)", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC },
    { field: 'Pct100Pov', label: "% Below Poverty", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC }, // cht comment out because not in data causes error
    { field: 'PctNoHealthIns', label: "% Without Health Insurance", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC },
    { field: 'PctEducBchPlus', label: "% With Bachelors Degree or Higher", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC },
    { field: 'PctEducLHS', label: "% Did Not Finish High School", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC },
    { field: 'PctDisabled', label: "% With a Disability", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC }, // cht comment out because not in data causes error
    { field: 'Pct_forborn', label: "% Foreign Born", format: 'percent', colorramp: CHOROPLETH_STYLE_DEMOGRAPHIC }, // 
];

// the style to use for the MAP_LAYERS.county GeoJSON overlay
var COUNTYBOUNDS_STYLE = { fill: false, color: 'black', weight: 5 };
var ZONEBOUNDS_STYLE = { fill: false, color: 'black', weight: 1 };

// map layers to be offered in the lower-right Map Layers control
// we have some complicated desires for layer stacking, such as labels and streets (L.TileLayer raster tiles) showing above CTA Zones (L.GeoJSON paths in overlayPane)
// so our choice of panes here is somewhat contrived and complicated
var MAP_LAYERS = [
    {
        id: 'basemap',
        label: "Base Map",
        checked: true,
        layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
            pane: 'tilePane',
            zIndex: 0,
            attribution: 'Map tiles by <a target="_blank" href="http://www.mapbox.com">MapBox</a>.<br />Data &copy; <a target="_blank" href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap contributings</a>',
        }),
    },
    {
        id: 'labels',
        label: "Labels",
        checked: true,
        layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_only_labels/{z}/{x}/{y}{r}.png', {
            pane: 'popupPane',
            zIndex: 999,
            attribution: 'Map tiles by <a target="_blank" href="http://www.mapbox.com">MapBox</a>.<br />Data &copy; <a target="_blank" href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap contributings</a>',
        }),
    },
    {
        id: 'counties',
        label: "Counties",
        layer: undefined,  // see initFixCountyOverlay() where we patch this in to become a L.GeoJSON layer, since that comes after startup promises but before initMap()
    },
    {
        id: 'zones',
        label: "Zones",
        checked: false,
        layer: undefined,  // see initFixCountyOverlay() where we patch this in to become a L.GeoJSON layer, since that comes after startup promises but before initMap()
    },
    // {
    //     id: 'places',
    //     label: "Places",
    //     layer: undefined,  // see initFixCountyOverlay() where we patch this in to become a L.GeoJSON layer, since that comes after startup promises but before initMap()
    // },
    // {
    //     id: 'streets',
    //     label: "Streets",
    //     layer: L.tileLayer('http://a.tile.stamen.com/toner-lines/{z}/{x}/{y}.png', {
    //         pane: 'markerPane',  // between CTA lines and CTA fills
    //         attribution: 'Map tiles by <a target="_blank" href="http://www.mapbox.com">MapBox</a>.<br />Data &copy; <a target="_blank" href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap contributings</a>',
    //         opacity: 0.75,
    //     }),
    // },
];

var CTATOPOJSONDATA, COUNTYTOPOJSONDATA;
var DATA_CANCER, DATA_DEMOGS, DATA_CTACITY, DATA_CTACOUNTY;

// a cache of geocoder results, so we don't have to re-geocode every time the form changes
// saves big on API keys, e.g. we don't need to hit Bing if someone changes the cancer site filter
var GEOCODE_CACHE = {};

$(document).ready(function () {
    const waitforparsing = [
        new Promise(function(resolve) {
            $.get(DATA_URL_CTAGEOM, (data) => { resolve(data); }, 'json');
        }),
        new Promise(function(resolve) {
            $.get(DATA_URL_COUNTYGEOM, (data) => { resolve(data); }, 'json');
        }),
        Papa.parsePromise(DATA_URL_DEMOGS),
        Papa.parsePromise(DATA_URL_CANCER),
        Papa.parsePromise(DATA_URL_CTACOUNTY),
        Papa.parsePromise(DATA_URL_CTACITY),
    ];

    Promise.all(waitforparsing).then(function (data) {
        CTATOPOJSONDATA = data[0];
        COUNTYTOPOJSONDATA = data[1];
        DATA_DEMOGS = data[2];
        DATA_CANCER = data[3];
        DATA_CTACOUNTY = data[4];
        DATA_CTACITY = data[5];
        initRenameState(SITE_CONSTANTS.stateName);
        initNumberOfCancerSites(SITE_CONSTANTS.numOfCancerSites);
        initNumberOfZones(SITE_CONSTANTS.numOfZones);
        initMinZonePop(SITE_CONSTANTS.minZonePop);
        initMaxZonePop(SITE_CONSTANTS.maxZonePop);
        initMinTractsPerZone(SITE_CONSTANTS.minTractsPerZone);
        initMaxTractsPerZone(SITE_CONSTANTS.maxTractsPerZone);
        initRaceList(SITE_CONSTANTS.raceList);
        initReportingMinCases(SITE_CONSTANTS.reportingMinCases);
        initStateRegistry(SITE_CONSTANTS.registry, SITE_CONSTANTS.registryLink);
        initFundingSource(SITE_CONSTANTS.fundingSource);
        initCitationInfo(SITE_CONSTANTS.citationInfo);
        initNationalCancerDataSourceInfo(SITE_CONSTANTS.nationalCancerDataSource);
        initAboutBlurb(SITE_CONSTANTS.aboutBlurb);
        initIncidenceDataDate(SITE_CONSTANTS.incidenceDataDate);
        initSociodemographicDataDateRange(SITE_CONSTANTS.sociodemographicDataDateRange);
        initValidateDemographicDataset();
        initValidateIncidenceDataset();
        initFixCountyOverlay();
        initFixZoneOverlay();
        // initFixPlaceOverlay();
        initDemographicTables();
        initMapAndPolygonData();
        initDataFilters(SITE_CONSTANTS.startingLocation);
        initTooltips();
        initPrintPage();
        initDownloadButtons();
        initFaqAccordion();
        initGoogleAnalyticsHooks();
        initTermsOfUse();
        initLoadInitialState();
        performSearch();
        initUrlParamUpdater();
    });   
});

Papa.parsePromise = function (url) {
    return new Promise(resolve => {
        Papa.parse(url, {
            download: true,
            header: true,
            skipEmptyLines: 'greedy',
            dynamicTyping: true,
            complete: csvdata => resolve(csvdata.data),
        });
    });
};

window.onload = function () {
    setTimeout(() => {
        const select = document.querySelector(".leaflet-choroplethlegend-select");
        if (!select) return;

        const legendgradient = document.querySelector(".leaflet-choroplethlegend-legendgradient");

        function adjustWidth() {
            let temp = document.createElement("span");
            document.body.appendChild(temp);
            let maxWidth = 200;
            let selectedOption = select.options[select.selectedIndex];
            temp.textContent = selectedOption.text;
            if (temp.offsetWidth > maxWidth){
                maxWidth = temp.offsetWidth;
            }
            document.body.removeChild(temp);
            select.style.width = `${maxWidth + 10}px`;
            legendgradient.style.width = `${maxWidth + 10}px`;
        }

        adjustWidth();
        select.addEventListener("change", adjustWidth);
    }, 100);
};



function initUrlParamUpdater () {
    setInterval(() => {
        updateUrlParams();
    }, 1 * 1000);
}

function initRenameState(name) {
    const elements = document.querySelectorAll('.stateName');
    if (name){ elements.forEach(element => { element.innerText = name })
    }
    document.title = `${name} Cancer Registry`;
}

function initNumberOfCancerSites(num) {
    const elements = document.querySelectorAll('.numOfCancerSites');
    if (num){ elements.forEach(element => { element.innerText = num })}
}

function initNumberOfZones(num) {
    const elements = document.querySelectorAll('.numZones');
    if (num){ elements.forEach(element => { element.innerText = num})}
}

function initMinZonePop(num) {
    const elements = document.querySelectorAll('.minZonePop');
    if (num){ elements.forEach(element => { element.innerText = num })}
}

function initMaxZonePop(num) {
    const elements = document.querySelectorAll('.maxZonePop');
    if (num){ elements.forEach(element => { element.innerText = num })}
}

function initMinTractsPerZone(num) {
    const elements = document.querySelectorAll('.minTractsPerZone');
    if (num){ elements.forEach(element => { element.innerText = num })}
}

function initMaxTractsPerZone(num) {
    const elements = document.querySelectorAll('.maxTractsPerZone');
    if (num){ elements.forEach(element => { element.innerText = num })}
}

function initRaceList(list) {
    const elements = document.querySelectorAll('.confirmRaceList');
    if (list){ elements.forEach(element => { element.innerText = list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1] })}
}

function initReportingMinCases(num) {
    const elements = document.querySelectorAll('.reportingMinCases');
    if (num){ elements.forEach(element => { element.innerText = num })}
}

function initStateRegistry(registry, link) {
    const elements = document.querySelectorAll('.stateRegistry');
    if (registry && link){
        elements.forEach(element => {
            element.innerText = registry;
            element.parentElement.href = link;
        });
    }
}

function initFundingSource(text) {
    const elements = document.querySelectorAll('.fundingSource');
    if (text){ elements.forEach(element => { element.innerText = text })}
}

function initCitationInfo(text) {
    const elements = document.querySelectorAll('.citationInfo');
    if (text){ elements.forEach(element => { element.innerText = text })}
}

function initNationalCancerDataSourceInfo(text) {
    const elements = document.querySelectorAll('.nationalCancerDataSource');
    if (text){ elements.forEach(element => { element.innerText = text })}
}

function initAboutBlurb(text) {
    const elements = document.querySelectorAll('.aboutBlurb');
    if (text){ elements.forEach(element => { element.innerText = text })}
}

function initIncidenceDataDate(text) {
    const elements = document.querySelectorAll('.incidenceDateDate');
    if (text){ elements.forEach(element => { element.innerText = text })}
}

function initSociodemographicDataDateRange(text) {
    const elements = document.querySelectorAll('.sociodemographicDataDateRange');
    if (text){ elements.forEach(element => { element.innerText = text })}
}

function initLoadInitialState () {
    const $searchwidgets = $('div.data-filters input[type="text"], div.data-filters select');
    const params = new URLSearchParams(window.location.search);

    ['address', 'site', 'sex', 'race', 'time'].forEach((fieldname) => {
        const $widget = $searchwidgets.filter(`[name="${fieldname}"]`);
        const value = params.get(fieldname);
        if (value) {
            $widget.val(value);
        }
    });

    if (params.get('overlays')) {
        const enablethese = params.get('overlays').split(',');
        MAP.layerpicker.getLayerStates().forEach(function (layerinfo) {
            const turnon = enablethese.indexOf(layerinfo.id) != -1;
            MAP.layerpicker.toggleLayer(layerinfo.id, turnon);
        });
    }
    if (params.get('choropleth')) {
        MAP.choroplethcontrol.setSelection(params.get('choropleth'));
    }
    else {
        MAP.choroplethcontrol.setSelection('AAIR');
    }
}


function initTooltips () {
    $('i[data-tooltip]').each(function () {
        const $trigger = $(this);
        const tooltipid = $(this).attr('data-tooltip');

        $trigger
        .attr('data-tooltip-content', `#tooltip_contents > div[data-tooltip="${tooltipid}"]`)
        .tooltipster({
            trigger: 'click',
            animation: 'fade',
            animationDuration: 150,
            distance: 0,
            maxWidth: 400,
            minWidth: 300,
            side: [ 'right', 'left', 'bottom', 'top' ],
            contentCloning: true,
            interactive: true, // don't auto-dismiss on mouse activity inside, let user copy text, follow links, ...
            functionBefore: function (instance, helper) {  // close open ones before opening this one
                jQuery.each(jQuery.tooltipster.instances(), function (i, instance) {
                    instance.close();
                });
            },
        });
    });
}


function initValidateIncidenceDataset () {
    const errors = [];
    if (! DATA_CANCER[0].Sex) errors.push("Field not found: sex");
    if (! DATA_CANCER[0].Cancer) errors.push("Field not found: cancer");
    if (! DATA_CANCER[0].Years) errors.push("Field not found: years");
    if (! DATA_CANCER[0].PopTot) errors.push("Field not found: PopTot");
    if (! DATA_CANCER[0].Cases) errors.push("Field not found: Cases");
    if (! DATA_CANCER[0].AAIR) errors.push("Field not found: AAIR");
    if (! DATA_CANCER[0].LCI) errors.push("Field not found: LCI");
    if (! DATA_CANCER[0].UCI) errors.push("Field not found: UCI");
    SEARCHOPTIONS_RACE.forEach(function (option) {
        if (! option.value) return; // the blank All Races Combined value
        if (! DATA_CANCER[0][`${option.value}_PopTot`]) errors.push(`Field not found: ${option.value}_PopTot`);
        if (! DATA_CANCER[0][`${option.value}_Cases`]) errors.push(`Field not found: ${option.value}_Cases`);
        if (! DATA_CANCER[0][`${option.value}_AAIR`]) errors.push(`Field not found: ${option.value}_AAIR`);
        if (! DATA_CANCER[0][`${option.value}_LCI`]) errors.push(`Field not found: ${option.value}_LCI`);
        if (! DATA_CANCER[0][`${option.value}_UCI`]) errors.push(`Field not found: ${option.value}_UCI`);
    });

    // the filter fields: make sure all of the stated values in fact match any rows; if not, it's surely a typo
    // it only makes sense to check these if we did not encounter a "this field doesn't exist" error above
    if (DATA_CANCER[0].Cancer) {
        SEARCHOPTIONS_CANCERSITE.forEach(function (option) {
            const matchesthisvalue = DATA_CANCER.filter(function (row) { return row.Cancer == option.value; }).length;
            if (! matchesthisvalue) errors.push(`Site filtering option ${option.value} not found in the data.`);
        });
    }
    if (DATA_CANCER[0].Sex) {
        SEARCHOPTIONS_SEX.forEach(function (option) {
            const matchesthisvalue = DATA_CANCER.filter(function (row) { return row.Sex == option.value; }).length;
            if (! matchesthisvalue) errors.push(`Sex filtering option ${option.value} not found in the data.`);
        });
    }
    if (DATA_CANCER[0].Years) {
        SEARCHOPTIONS_TIME.forEach(function (option) {
            const matchesthisvalue = DATA_CANCER.filter(function (row) { return row.Years == option.value; }).length;
            if (! matchesthisvalue) errors.push(`Time filtering option ${option.value} not found in the data.`);
        });
    }

    // the CANCER_SEXES sex-specific cancers; check that these are real site and sex options
    Object.keys(CANCER_SEXES).forEach(function (site) {
        const isanoption = SEARCHOPTIONS_CANCERSITE.filter(function (option) { return option.value == site; }).length;
        if (! isanoption) errors.push(`Site ${site} in CANCER_SEXES is not an option in SEARCHOPTIONS_CANCERSITE`);
    });
    Object.values(CANCER_SEXES).forEach(function (sex) {
        const isanoption = SEARCHOPTIONS_SEX.filter(function (option) { return option.value == sex; }).length;
        if (! isanoption) errors.push(`Sex ${sex} in CANCER_SEXES is not an option in SEARCHOPTIONS_SEX`);
    });

    // check that all sex/time/site combinations will in fact match any rows, or else that they are noted in CANCER_SEXES
    // and that for each known-valid combination, at least one row is Statewide so we know they are using it
    // again, skip generating hundreds of errors if we the fields don't even exist (we caught that earlier)
    if (DATA_CANCER[0].GeoID && DATA_CANCER[0].Cancer && DATA_CANCER[0].Sex && DATA_CANCER[0].Years) {
        SEARCHOPTIONS_SEX.forEach(function (sexoption) {
            SEARCHOPTIONS_TIME.forEach(function (timeoption) {
                SEARCHOPTIONS_CANCERSITE.forEach(function (siteoption) {
                    if (CANCER_SEXES[siteoption.value] && CANCER_SEXES[siteoption.value] != sexoption.value) return;

                    const matchesthiscombo = DATA_CANCER.filter(function (row) {
                        return row.Years == timeoption.value && row.Sex == sexoption.value && row.Cancer == siteoption.value;
                    });
                    const hasstatewide = matchesthiscombo.filter(function (row) {
                        // return row.GeoID == 'Statewide';
                        return row.GeoID == SITE_CONSTANTS.ctaid;
                    });
                    if (! matchesthiscombo.length) errors.push(`No data rows would match ${timeoption.value}/${siteoption.value}/${sexoption.value}`);
                    else if (! hasstatewide.length) errors.push(`No Statewide data rows for ${timeoption.value}/${siteoption.value}/${sexoption.value}`);
                });
            });
        });
    }

    // if we found errors, throw a tantrum and die
    // log them to the error log in case they're watching the console, and throw them as an alert() in case they are not
    if (errors.length) {
        // throw them to the error log
        errors.forEach(function (errmsg) {
            console.error(`initValidateIncidenceDataset() ${errmsg}`);
        });

        // alert them
        const errmsg = `initValidateIncidenceDataset() found errors in the incidence dataset:\n${errors.join("\n")}`;
        alert(errmsg);

        // die
        throw "initValidateIncidenceDataset() reported errors. Quitting.";
    }
}


function initValidateDemographicDataset () {
    // check the fields in the DATA_DEMOGS versus the settings in DEMOGRAPHIC_TABLES et al.
    const errors = [];

    // the basic identifying fields, make sure they exist
    if (! DATA_DEMOGS[0].GeoID) errors.push("Field not found: Zone");

    // go over the DEMOGRAPHIC_TABLES and CHOROPLETH_OPTIONS and make sure all stated fields exist
    // having valid values, is their own problem...
    DEMOGRAPHIC_TABLES.forEach(function (tableinfo) {
        tableinfo.rows.forEach(function (rowinfo) {
            if (typeof DATA_DEMOGS[0][rowinfo.field] == 'undefined') errors.push(`DEMOGRAPHIC_TABLES nonexistent demographic field ${rowinfo.field}`);
        });
    });
    CHOROPLETH_OPTIONS.forEach(function (vizopt) {
        if (vizopt.field == 'AAIR' || vizopt.field == 'Cases') return;  // these are fixed incidence fields, ignore
        if (typeof DATA_DEMOGS[0][vizopt.field] == 'undefined') errors.push(`CHOROPLETH_OPTIONS nonexistent demographic field ${vizopt.field}`);
    });

    // there should be as many Statewide demographics rows as there are options in SEARCHOPTIONS_TIME; that is, one per time period
    // same goes for Nationwide: 1 per time period
    if (DATA_DEMOGS[0].GeoID) {
        const hasstatewide = DATA_DEMOGS.filter(function (row) { return row.GeoID == SITE_CONSTANTS.ctaid; });
        if (hasstatewide.length != SEARCHOPTIONS_TIME.length) errors.push(`Found ${hasstatewide.length} demographic rows for Statewide`);

        if (NATIONWIDE_DEMOGRAPHICS) {
            const hasnationwide = DATA_DEMOGS.filter(function (row) { return row.GeoID == 'US'; });
            if (hasnationwide.length != SEARCHOPTIONS_TIME.length) errors.push(`Found ${hasnationwide.length} demographic rows for Nationwide`);
        }
    }

    // if we found errors, throw a tantrum and die
    // log them to the error log in case they're watching the console, and throw them as an alert() in case they are not
    if (errors.length) {
        // throw them to the error log
        errors.forEach(function (errmsg) {
            console.error(`initValidateDemographicDataset() ${errmsg}`);
        });

        // alert them
        const errmsg = `initValidateDemographicDataset() found errors in the incidence dataset:\n${errors.join("\n")}`;
        alert(errmsg);

        // die
        throw "initValidateDemographicDataset() reported errors. Quitting.";
    }
}


function initFixCountyOverlay () {
    const maplayerinfo = MAP_LAYERS.filter(function (maplayerinfo) { return maplayerinfo.id == 'counties'; })[0];
    maplayerinfo.layer = L.topoJson(COUNTYTOPOJSONDATA, {
        pane: 'tooltipPane',
        zIndex: 500,
        style: COUNTYBOUNDS_STYLE,  // see performSearchMap() where these are reassigned based on filters
    });
}

function initFixZoneOverlay () {
    const maplayerinfo = MAP_LAYERS.filter(function (maplayerinfo) { return maplayerinfo.id == 'zones'; })[0];
    maplayerinfo.layer = L.topoJson(CTATOPOJSONDATA, {
        pane: 'tooltipPane',
        zIndex: 500,
        style: ZONEBOUNDS_STYLE,  // see performSearchMap() where these are reassigned based on filters
    });
}

// function initFixPlaceOverlay () {
//     const maplayerinfo = MAP_LAYERS.filter(function (maplayerinfo) { return maplayerinfo.id == 'places'; })[0];
//     maplayerinfo.layer = L.topoJson(PlaceTOPOJSONDATA, {
//         pane: 'tooltipPane',
//         zIndex: 500,
//         style: COUNTYBOUNDS_STYLE,  // see performSearchMap() where these are reassigned based on filters
//     });
// }


function initPrintPage () {
    const $printbutton = $('#printpagebutton');
    const $mapdomnode = $('#map').parent('div').get(0);
    const originalclasslist = $mapdomnode.className;
    const $incidencebarchart = $('#incidence-barchart');
    let hiddenMarkers = [];

    $printbutton.data('ready-html', $printbutton.html() );
    $printbutton.data('busy-html', '<i class="fa fa-clock"></i> Printing');

    let leafletControls = [];

    window.addEventListener('beforeprint', function () {
        leafletControls = [
            document.querySelector('.leaflet-control-attribution'),
            document.querySelector('.leaflet-control-zoom'),
            document.querySelector('.leaflet-control-boxzoom'),
            document.querySelector('.leaflet-control-scale'),
            document.querySelector('.leaflet-layerpicker-control')
        ];
        leafletControls.forEach(control => {
            if (control) {
                control.style.display = 'none';
            }
        });
        $printbutton.html( $printbutton.data('busy-html') );
        hiddenMarkers = [];
        MAP.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                hiddenMarkers.push(layer);
                MAP.removeLayer(layer);
            }
        });
        MAP.invalidateSize();
    });

    window.addEventListener('afterprint', function () {
        leafletControls.forEach(control => {
            if (control) {
                control.style.display = '';
            }
        });
        $incidencebarchart.removeClass('printing');
        $mapdomnode.className = originalclasslist;
        MAP.invalidateSize();
        $printbutton.html( $printbutton.data('ready-html') );
        hiddenMarkers.forEach(marker => MAP.addLayer(marker));
        hiddenMarkers = [];
    });
}


function initDownloadButtons () {
    const $downloadtogglebutton = $('#downloadbutton');
    const $downloadtogglecaret = $downloadtogglebutton.children('i.fa').last();
    const $downloadoptions = $('#downloadoptions');
    const $downloadlinks = $downloadoptions.find('a');
    const $printmapbutton = $downloadlinks.filter('[data-export="map"]');

    // clicking the button toggles the download options
    // clicking a download option should not propagate and click the button, effectively collapsing it
    $downloadtogglebutton.click(function () {
        const already = $downloadoptions.not('.d-none').length;
        if (already) {
            $downloadtogglecaret.addClass('fa-caret-down').removeClass('fa-caret-up');
            $downloadoptions.addClass('d-none');
            $downloadoptions.attr('aria-expanded', 'false');
        }
        else {
            $downloadtogglecaret.addClass('fa-caret-up').removeClass('fa-caret-down');
            $downloadoptions.removeClass('d-none');
            $downloadoptions.attr('aria-expanded', 'true');
        }
    });
    $downloadlinks.click(function (event) {
        event.stopPropagation();
    });

    // Zone Data and All Data are plain hyperlinks to static ZIP files
    // but Zone Data changes its URL to whatever CTA Zone is selected; see performSearchUpdateDataDownloadLinks()
    // $downloadinks.filter('[data-export="zonedata"]');
    // $downloadinks.filter('[data-export="all"]');

    // Download Map is a tedious slog, because we want to hide some Leaflet controls, leave some, and customize some others
    // this means hooks in some specific controls such as MAP.choroplethcontrol.setPrintMode()
    // we also want the print button to change text because printing can take several seconds...
    $printmapbutton.click(() => {
        // the filename is based on the choropleth selection; .png is added automatically
        const choroplethlabel = MAP.choroplethcontrol.getSelectionLabel().replace('%', 'Percent').replace(/\W/, '');
        const filename = `MapExport-${choroplethlabel}`;
        MAP.printplugin.printMap('CurrentSize', filename);
    });

    $printmapbutton.data('ready-html', $printmapbutton.html() );  // fetch whatever the HTML is when the page loads, so we don't have to repeat ourselves here
    $printmapbutton.data('busy-html', '<i class="fa fa-clock"></i> One Moment');
    MAP.on('easyPrint-start', () => {
        $printmapbutton.html( $printmapbutton.data('busy-html') );
    });
    MAP.on('easyPrint-finished', () => {
        $printmapbutton.html( $printmapbutton.data('ready-html') );
    });

    MAP.on('easyPrint-start', () => {
        // workaround for a bug in easyPrint: set an explicit width & height on the map DIV, so easyPrint will get the size right
        // without this, big empty space aorund the map inside a giant canvas, and predefined print sizes fail
        // see the easyPrint-finished event handler, which clears these so the map can be respinsive again
        const mapsize = MAP.getSize();
        const mapdiv = MAP.getContainer();
        mapdiv.style.width = `${mapsize.x}px`;
        mapdiv.style.height = `${mapsize.y}px`;

        // enable the "print mode hacks" in the map controls that were kept visible
        MAP.choroplethcontrol.setPrintMode(true);
    });
    MAP.on('easyPrint-finished', () => {
        // workaround for a bug in easyPrint: an explicit W&H were asserted above; clear those so the map can again be responsive
        const mapdiv = MAP.getContainer();
        mapdiv.style.removeProperty('width');
        mapdiv.style.removeProperty('height');

        // clear the "print mode hacks" in the map controls that were kept visible
        MAP.choroplethcontrol.setPrintMode(false);
    });
}


function initDemographicTables () {
    const $demographics_section = $('#demographic-tables');
    DEMOGRAPHIC_TABLES.forEach(function (tableinfo) {
        const $table = $(`
            <table class="table-striped table-sm">
                <thead>
                    <tr>
                        <th class="nowrap left"><span class="subtitle" tabindex="0">${tableinfo.title}</span></th>
                        <th class="nowrap right typeName" data-region="cta" >Zone</th>
                        <th class="nowrap right" data-region="state" >Statewide</th>
                        <th class="nowrap right" data-region="nation" >Nationwide</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        `);

        const $tbody = $table.children('tbody');
        tableinfo.rows.forEach(function (tablerowinfo) {
            const tooltiphtml = tablerowinfo.tooltip_id ? `<i class="fa fa-info-circle"  data-tooltip="${tablerowinfo.tooltip_id}"></i>` : '';

            $(`
                <tr>
                    <th scope="row">${tablerowinfo.label} ${tooltiphtml}</th>
                    <td class="right nowrap" data-region="cta"><span data-region="cta" data-statistic="${tablerowinfo.field}"></span></td>
                    <td class="right nowrap" data-region="state"><span data-region="state" data-statistic="${tablerowinfo.field}"></span></td>
                    <td class="right nowrap" data-region="nation"><span data-region="nation" data-statistic="${tablerowinfo.field}"></span></td>
                </tr>
            `).appendTo($tbody);
        });

        $table.appendTo($demographics_section);
    });
}


function initMapAndPolygonData () {
    // the map basics
    // a scale bar
    MAP = L.map('map', {
        minZoom: SITE_CONSTANTS.MIN_ZOOM,
        maxZoom: SITE_CONSTANTS.MAX_ZOOM,
    })
    .fitBounds(SITE_CONSTANTS.MAP_BBOX);

    L.control.scale().addTo(MAP);

    L.Control.boxzoom({
        position:'topleft',
    }).addTo(MAP);

    // a marker for address searches
    var blackIcon = L.icon({
        iconUrl: 'static/map_marker.svg',

        iconSize:     [36.25, 51.25], // size of the icon
        iconAnchor:   [17.75, 41.25], // point of the icon which will correspond to marker's location
    });
    
    MAP.addressmarker = L.marker([0, 0], {
        pane: 'popupPane',
        icon: blackIcon
    });

    // the layer-picker control
    MAP.layerpicker = new L.Control.LayerPicker({
        expanded: true,
        layers: MAP_LAYERS,
        onLayerChange: function (layerid, show) {
            logGoogleAnalyticsEvent('map', show ? 'overlay-on' : 'overlay-off', layerid);
        },
    }).addTo(MAP);

    // a hack for printing; the printing system fails if there are any tile errors
    // try to catch those and create new transparent PNGs for missing tiles, to appease it
    function handleTileError (error) {
        error.tile.src = 'static/transparent_256x256.png';
    }
    MAP_LAYERS.forEach(function (maplayeroption) {
        maplayeroption.layer.on('tileerror', handleTileError);
    });

    // for printing, see initDownloadButtons()
    // this includes events to toggle the button between Download and Wait modes, which differs from the approach used by CSV exporter
    // and includes CSS hacks to modify the style of some elements in the printout, e.g. select element borders
    // see also initDownloadButtons() which has peripheral triggers, e.g. prepare the map, hide the print button, etc.
    MAP.printplugin = L.easyPrint({
      	sizeModes: ['Current'],  // no other eize really works, and makes the map vanish as it is resized for printing anyway; yuck
      	exportOnly: true,
        hidden: true,  // no UI button, we have our own
        // don't print controls... well, except...
        hideControlContainer: false,
        hideClasses: [
            // hide these other controls
            'leaflet-layerpicker-control', 'leaflet-control-attribution',
            'leaflet-control-zoom', 'leaflet-control-boxzoom',
            // within the choroplethlegend control which we do not hide, setPrintMode() sets certain CSS to show/hide those items
        ],
    }).addTo(MAP);

    // the TopoJSON layer of CTAs
    // and a custom control to color them forming a choropleth, and to change that coloring
    // but nothing's ever easy!
    // they decided later that they want to stick a tilelayer in between the fills and the boundary lines,
    // so there are in fact two JSON layers, and performSearchMap() manages both of them to highlight one, color the other, ...
    // the tilelayer then has a zindex within markerPane to fit it in between

    MAP.ctapolygonfills = L.topoJson(CTATOPOJSONDATA, {
        pane: 'shadowPane',
        style: CHOROPLETH_STYLE_NODATA,  // see performSearchMap() where these are reassigned based on filters
    })
    .addTo(MAP);

    MAP.ctapolygonbounds = L.topoJson(CTATOPOJSONDATA, {
        pane: 'tooltipPane',
        style: CHOROPLETH_BORDER_DEFAULT,  // see performSearchMap() where these are reassigned based on filters
    })
    .addTo(MAP);

    MAP.countypolygonfills = L.topoJson(COUNTYTOPOJSONDATA, {
        pane: 'shadowPane',
        style: CHOROPLETH_STYLE_NODATA_CLEAR,  // see performSearchMap() where these are reassigned based on filters
    })
    .addTo(MAP);

    MAP.countypolygonbounds = L.topoJson(COUNTYTOPOJSONDATA, {
        pane: 'tooltipPane',
        style: CHOROPLETH_BORDER_NONE,  // see performSearchMap() where these are reassigned based on filters
    })
    .addTo(MAP);

    MAP.choroplethcontrol = new L.Control.ChoroplethLegend({
        expanded: true,
        selectoptions: CHOROPLETH_OPTIONS,
        onChoroplethChange: (picked) => {
            performSearch();
            logGoogleAnalyticsEvent('map', 'choropleth', picked);
        },
    }).addTo(MAP);

    // clicking the map = find latlng, set this as a latlng address search, and let performSearch() take its course
    MAP.on('singleclick', function (event) {
        const $searchwidgets = $('div.data-filters input[type="text"], div.data-filters select');
        const $addressbox = $searchwidgets.filter('[name="address"]');
        const address = `${event.latlng.lat.toFixed(5)},${event.latlng.lng.toFixed(5)}`;
        $addressbox.val(address).change();
    });
}


function initDataFilters (location) {
    // part 1: fill in the SELECT options from the configurable constants
    const $searchwidgets_site = $('div.data-filters select[name="site"]');
    const $searchwidgets_sex = $('div.data-filters select[name="sex"]');
    const $searchwidgets_race = $('div.data-filters select[name="race"]');
    const $searchwidgets_time = $('div.data-filters select[name="time"]');
    const $searchwidgets_type = $('div.data-filters select[name="type"]');

    SEARCHOPTIONS_CANCERSITE.forEach(function (option) {
        $(`<option value="${option.value}">${option.label}</option>`).appendTo($searchwidgets_site);
    });
    SEARCHOPTIONS_RACE.forEach(function (option) {
        $(`<option value="${option.value}">${option.label}</option>`).appendTo($searchwidgets_race);
    });
    SEARCHOPTIONS_SEX.forEach(function (option) {
        $(`<option value="${option.value}">${option.label}</option>`).appendTo($searchwidgets_sex);
    });
    SEARCHOPTIONS_TIME.forEach(function (option) {
        $(`<option value="${option.value}">${option.label}</option>`).appendTo($searchwidgets_time);
    });
    SEARCHOPTIONS_TYPE.forEach(function (option) {
        $(`<option value="${option.value}">${option.label}</option>`).appendTo($searchwidgets_type);
    });

    if (getOptionCount('time') < 2) {  // since some datasets have only 1 option
        $searchwidgets_time.closest('div.input-group').hide();
    }
    
    $('#data-filters-address').val(location);

    // part 2: add actions to the search widgets
    // the search widgets: select race/sex/cancer/time and trigger a search
    // some selections may need to force others, e.g. some cancer selections will force a sex selection
    const $searchwidgets = $('div.data-filters input[type="text"], div.data-filters select');
    const $filtersummary = $('div.data-filters-summary');

    $searchwidgets.change(function () {
        // before we submit the search, see if we need to select a specific sex for some sex-restricted cancer types
        const $this = $(this);
        if ($this.is($searchwidgets_site)) {
            const autopick_sex = CANCER_SEXES[$this.val()];
            if (autopick_sex) {
                $searchwidgets_sex.val(autopick_sex);
            }
        }

        // go ahead and search
        performSearch();
    });


    // performSearch() will zoom the map to the searched CTA Zone, but only if the reason for the search was a changed address search
    // e.g. changing sex should not re-zoom the map
    // this hasbeenchanged datum is how we detect that an address change is the reason for the re-search
    $searchwidgets.filter('[name="address"]')
    .keydown(function (event) {
        // don't update our flag if the keypress was a tab; it was probably a screenreader just passing through
        if (event.keyCode != 9) $(this).data('hasbeenchanged', true);

        if (event.keyCode == 13) $(this).blur();
    });

    // the anti-filters: Xs in the div.data-filters-summary which will clear a specific filter
    // how we clear the filter varies: most are select, one is text
    // at any rate, upon clearing the filter trigger its change to re-search
    $filtersummary.on('keypress', 'div', function (event) {
        if (event.keyCode == 13) $(this).click();  // ARIA/508 translate hitting enter as clicking
    });
    $filtersummary.on('click', '[data-filter]', function () {
        const whichfilter = $(this).closest('span').attr('data-filter');
        const $widget = $searchwidgets.filter(`[name="${whichfilter}"]`);

        if ($widget[0].tagName == 'SELECT') {
            // select element; reset to first option, whatever that is
            const value = $widget.find('option').first().prop('value');
            $widget.val(value).change();
        }
        else if ($widget[0].tagName == 'INPUT' && $widget.prop('type') == 'text') {
            // text element, blank its value
            $widget.val('').change();
        }
        else {
            throw "Clear filter: unknown filter type";
        }
    });
}


function initFaqAccordion () {
    // in the FAQ, clicking a DT toggles the DD
    const $buttons = $('#learn-faq button.usa-accordion__button');
    $buttons.click(function (event) {
        const $this = $(this);
        const $definition = $this.closest('h2').next('.usa-accordion__content');
        const isvisible = $this.attr('aria-expanded') == 'true';

        if (isvisible) {
            $this.attr('aria-expanded', 'false');
            $definition.attr('hidden', '');
        }
        else {
            $this.attr('aria-expanded', 'true');
            $definition.removeAttr('hidden');
        }

        // don't try to follow the link, which is # instead of javascript:void(0) to satisfy WAVE
        event.preventDefault();
    });

    const $toggleall = $('#learn-faq .faqs_toggle button');
    $toggleall.click(function () {
        const $this = $(this);
        const allexpanded = $this.text() == 'Collapse All FAQs';

        if (allexpanded) {
            $buttons.filter('[aria-expanded="true"]').click();
            $this.text('Expand All FAQs');
        }
        else {
            $buttons.filter('[aria-expanded="false"]').click();
            $this.text('Collapse All FAQs');
        }
    });
}


function initTermsOfUse () {
    const $modal = $('#termsofusemodal');
    const $acceptbutton = $modal.find('button');
    const $attachtopleft = $('#above-map');

    // not a real BS modal but a DIV with a contrived position and size, to make it cover up the map and data portions of the page
    // so we have to do our own resizing handler, to make it continue to cover up even if they change size
    $(window).resize(function () {
        const height = $('#above-map').height() + $('#search-and-map').height() + $('#filters-and-aairbarchart').height() + $('#demographic-tables').height() + 25;  // extra for various padding, spacing, margins
        const width = $('#search-and-map').width() + 15 + 15;  // add 2*15 to match .container padding

        $modal.css({
            height: `${height}px`,
            width: `${width}px`,
            top: `${$attachtopleft.offset().top}px`,
            left: `${$attachtopleft.offset().left}px`,
        });
    });

    // clickin the button = set the cookie and clear the modal
    $acceptbutton.click(function () {
        document.cookie = "termsaccepted=true;max-age=31536000";
        $modal.addClass('d-none');
    });

    // unless we have a cookie set, go ahead and show the modal, triggering a resize event now to assert its size and position
    const hastermscookie = document.cookie.split(';').filter(item => item.indexOf('termsaccepted=true') >= 0).length;
    if (! hastermscookie) {
        setTimeout(function () {
            $(window).resize();
            $modal.removeClass('d-none');
        }, 0.5 * 1000);
    }
}


function initGoogleAnalyticsHooks () {
    // the search widgets
    $('div.data-filters select[name="site"]').change(function () {
        const value = getLabelFor('site', $(this).val());
        logGoogleAnalyticsEvent('search', 'site', value);
    });
    $('div.data-filters select[name="sex"]').change(function () {
        const value = getLabelFor('sex', $(this).val());
        logGoogleAnalyticsEvent('search', 'sex', value);
    });
    $('div.data-filters select[name="race"]').change(function () {
        const value = getLabelFor('race', $(this).val());
        logGoogleAnalyticsEvent('search', 'race', value);
    });
    $('div.data-filters input[name="address"]').change(function () {
        const value = $(this).val();
        if (! value) return;
        logGoogleAnalyticsEvent('search', 'address', value);
    });

    // print/export stuff
    $('#printpagebutton').click(function () {
        logGoogleAnalyticsEvent('export', 'print');
    });
    $('#downloadoptions a[data-export="map"]').click(function () {
        logGoogleAnalyticsEvent('export', 'mapimage');
    });
    // $('#downloadoptions a[data-export="zonedata"]').click(function () {
    //     const value = $(this).attr('data-ctaid');
    //     logGoogleAnalyticsEvent('export', 'zonedata', value);
    // });
    // $('#downloadoptions a[data-export="alldata"]').click(function () {
    //     logGoogleAnalyticsEvent('export', 'alldata');
    // });

    // switching tab sections in the bottom Learn area
    $('#learn-text ul.nav a[data-toggle="tab"]').on('shown.bs.tab', function () {
        const value = $(this).text();  // text of the A that changed the tab selection
        logGoogleAnalyticsEvent('learn', 'tabchange', value);
    });

    // map events, including some reall custom mods to the controls to the custom controls to capture these events
    // MAP.choroplethcontrol -- see the constructor's onChoroplethChange callback
    // MAP.layerpicker -- see the constructor's onLayerChange callback
}


//
// FUNCTIONS
//

function performSearch () {
    toggleAddressSearchFailure(false);
    MAP.addressmarker.setLatLng([0, 0]).removeFrom(MAP);
    const $searchwidgets = $('div.data-filters input[type="text"], div.data-filters select');
    const $addrbox = $searchwidgets.filter('[name="address"]');
    const causedbyaddresschange = $addrbox.data('hasbeenchanged');
    $addrbox.data('hasbeenchanged', false);

    const params = compileParams();
    console.log('params: ', params)
    params.ctaid = SITE_CONSTANTS.ctaid;
    params.ctaname = SITE_CONSTANTS.stateName;
    if (params.address) {
        const isctaid = params.address.match(/^\s*((A|B)\d\d\d\d)\s*$/);
        const conainsctaid = params.address.match(/\(((A|B)\d\d\d\d)\)/);
        if (isctaid || conainsctaid) {
            const ctaid = isctaid ? isctaid[1] : conainsctaid[1];
            const cta = findCTAById(ctaid);
            if (cta) {
                params.ctaid = cta.feature.properties.ZoneIDOrig;
                params.ctaname = cta.feature.properties.ZoneName.replace(/\_\d+$/, '');
                params.bbox = causedbyaddresschange ? cta.getBounds() : null;
                performSearchReally(params);
            }
            else {
                toggleAddressSearchFailure('Could not find that CTA');
            }
        }
        else {
            geocodeAddress(params.address, function (latlng) {
                if (! latlng) return toggleAddressSearchFailure('Could not find that address');
                const searchlatlng = [ latlng[0], latlng[1] ];
                const zone = findCTAContainingLatLng(searchlatlng);
                const county = findCountyContainingLatLng(searchlatlng)
                if (zone) {
                    params.ctaid = zone.feature.properties.ZoneIDOrig;
                    params.ctaname = zone.feature.properties.ZoneName.replace(/\_\d+$/, '');
                    params.latlng = searchlatlng;
                    params.bbox = causedbyaddresschange ? zone.getBounds() : null;
                    params.countyId = county.feature.properties.GEOID
                    params.countyName = county.feature.properties.Name
                    performSearchReally(params);
                }
                else {
                    MAP.addressmarker.setLatLng(searchlatlng).addTo(MAP);
                    toggleAddressSearchFailure('Data not available for that location');
                    performSearchReally(params);
                }
            });
        }
    }
    else {
        performSearchReally(params);
    }
}


function performSearchReally (searchparams) {
    const typeNames = $('.typeName')
    if(searchparams.type == 'Zone'){
        for (let i=0; i < typeNames.length; i++){
            typeNames[i].innerHTML = "Zone"
        }
    }
    if(searchparams.type == 'County'){
        for (let i=0; i < typeNames.length; i++){
            typeNames[i].innerHTML = "County"
        }
    }
    performSearchMap(searchparams);
    performSearchDemographics(searchparams);
    performSearchPlaces(searchparams);
    performSearchIncidenceReadout(searchparams);
    performSearchIncidenceBarChart(searchparams);
    
    // performSearchUpdateDataDownloadLinks(searchparams); // commented out until file downloads addressed
}

function performSearchDemographics (searchparams) {
    let demogdata_cta = DATA_DEMOGS.filter(function (row) { return row.GeoID == searchparams.ctaid && row.Years == searchparams.time; })[0];
    if (searchparams.type == 'County'){
        const demogdata_county = DATA_DEMOGS.filter(function (row) { return row.GeoID == searchparams.countyId && row.Years == searchparams.time; })[0];
        demogdata_cta = demogdata_county
    }
    const demogdata_state = DATA_DEMOGS.filter(function (row) { return row.GeoID == SITE_CONSTANTS.ctaid && row.Years == searchparams.time; })[0];
    const demogdata_nation = DATA_DEMOGS.filter(function (row) { return row.GeoID == 'US' && row.Years == searchparams.time; })[0];
    const $demographics_section = $('#demographic-tables');
    const $ctastats = $demographics_section.find('[data-region="cta"]');
    const $nationstats = $demographics_section.find('[data-region="nation"]');

    // show/hide the CTA Zone content, depending whether a CTA Zone was selected (that is, not Statewide)
    if (searchparams.ctaid == SITE_CONSTANTS.ctaid) {
        $ctastats.hide();
    }
    else {
        $ctastats.show();
    }

    // show/hide the Nationwide cells, depending on the global setting
    if (NATIONWIDE_DEMOGRAPHICS) {
        $nationstats.show();
    }
    else {
        $nationstats.hide();
    }

    // fill in the blanks: the CTA name and ID
    let ctanametext = searchparams.ctaname;
    if (searchparams.type == 'County'){
        ctanametext = searchparams.countyName + ' County'
    }
    const ctaidtext = searchparams.ctaid == SITE_CONSTANTS.ctaid ? '' : `(${demogdata_cta.GeoID})`;
    $demographics_section.find('span[data-statistics="ctaname"]').text(ctanametext);
    // $demographics_section.find('span[data-statistics="ctaid"]').text(ctaidtext);
    $demographics_section.find('span[data-statistics="ctaname"]').closest('span.subtitle').prop('aria-label', ctanametext + ' ' + ctaidtext);

    // fill in the blanks: demographics
    // go over the DEMOGRAPHIC_TABLES which we used to construct the table, and fill in the corresponding values for CTA & Statewide demographics
    DEMOGRAPHIC_TABLES.forEach(function (tableinfo) {
        tableinfo.rows.forEach(function (tablerowinfo) {
            const $slots_cta = $demographics_section.find(`span[data-region="cta"][data-statistic="${tablerowinfo.field}"]`);
            const value_cta = formatFieldValue(demogdata_cta[tablerowinfo.field], tablerowinfo.format);
            // console.log('value_cta', value_cta)
            $slots_cta.text(value_cta);

            const $slots_state = $demographics_section.find(`span[data-region="state"][data-statistic="${tablerowinfo.field}"]`);
            const value_state = formatFieldValue(demogdata_state[tablerowinfo.field], tablerowinfo.format);
            $slots_state.text(value_state);

            if (NATIONWIDE_DEMOGRAPHICS) {
                const $slots_nation = $demographics_section.find(`span[data-region="nation"][data-statistic="${tablerowinfo.field}"]`);
                const value_nation = formatFieldValue(demogdata_nation[tablerowinfo.field], tablerowinfo.format);
                $slots_nation.text(value_nation);
            }
        });
    });
}


function performSearchPlaces (searchparams) {
    if (searchparams.ctaid == SITE_CONSTANTS.ctaid) return;
    const counties = DATA_CTACOUNTY.filter(row => row.ZoneIDOrig == searchparams.ctaid).map(row => `${row.County} County`);
    const cities = DATA_CTACITY.filter(row => row.ZoneIDOrig == searchparams.ctaid).map(row => row.City);
    counties.sort();
    cities.sort();
    const $putafterthisone = $('div.places-area');
    $putafterthisone.empty()
    $("<h3 class='title'></h3>").text('Location Details').appendTo($putafterthisone);

    if (searchparams.type == 'Zone') {
        const text = searchparams.ctaname + ' (' + searchparams.ctaid + ')'
        const $block = $("<div ></div>").html(`<b class='subtitle'>Zone: </b>`).appendTo($putafterthisone);
        $("<span></span>").text(text).appendTo($block);
    }
    if (counties.length) {
        const text = counties.join(', ');
        const $block = $('<div></div>').html(`<b class='subtitle'>Counties: </b>`).appendTo($putafterthisone);
        $('<span></span>').text(text).appendTo($block);
    }
    if (cities.length && searchparams.type == "Zone") {
        const text = cities.join(', ');
        const $block = $('<div></div>').html(`<b class='subtitle'>Places: </b>`).appendTo($putafterthisone);
        $('<span></span>').text(text).appendTo($block);
    }

    updateFilterSummary(searchparams)
    
}

function updateFilterSummary(searchparams) {
    const $summaryContainer = $('#data-filters-summary');
    $summaryContainer.find('.filters-list').remove();
    let summaryHtml = '<div class="filters-list" style="margin-top: 10px;">';

    $('.data-filters .input-group').each(function () {
        let label = $(this).find('label').text().trim();
        const input = $(this).find('select, input');
        let value = input.val() ? input.val().trim() : 'Not Selected';

        if (input.is('select')) {
            value = input.find('option:selected').text().trim();
        }

        if (label.includes('Location Search') && searchparams.type == "Zone") {
            label = "Location"
            value = searchparams.ctaname + ' (' + searchparams.ctaid + ')';
        }

        if (label.includes('Location Search') && searchparams.type == "County") {
            label = "Location"
            value = searchparams.countyName + " County";
        }

        let valueStyle = 'background-color: #e6eaff;; padding: 5px;';
        if (label === 'Location') {
            valueStyle = 'background-color: #feecd4; padding: 5px;';
        }

        summaryHtml += `<div style="margin-bottom: 15px;">
                            <span class="subtitle" >${label}:</span> <span style="font-weight: bold; ; ${valueStyle}">${value}</span>
                        </div>`;
    });

    summaryHtml += '</div>';

    $summaryContainer.append(summaryHtml);
}




function performSearchIncidenceReadout (searchparams) {
    const $incidence_section = $('#incidence-title');
    let ctanametext = searchparams.ctaname;
    if (searchparams.type == 'County'){
        ctanametext = searchparams.countyName + ' County'
    }
    $incidence_section.find('span[data-statistics="ctaname"]').text(ctanametext);

    // incidence data is three rows: cases & incidence rate, for the selected Zone, the Statewide, and Nationwide
    // the race does not filter a row, but rather determines which fields are the relevant incidence/MOE numbers
    //
    // note that we could end up with 0 rows e.g. there is no row for Male Uterine nor Female Prostate
    // we could also end up with null values for some data, e.g. low sample sizes so they chose not to report a value
    let cancerdata_cta = DATA_CANCER.filter(row => row.GeoID == searchparams.ctaid && row.Years == searchparams.time && row.Cancer == searchparams.site && row.Sex == searchparams.sex)[0];
    if (searchparams.type == 'County'){
        const cancerdata_county = DATA_CANCER.filter(row => row.GeoID == searchparams.countyId && row.Years == searchparams.time && row.Cancer == searchparams.site && row.Sex == searchparams.sex)[0];
        console.log('cancerdata_county: ', cancerdata_county)
        cancerdata_cta = cancerdata_county
    }

    const cancerdata_state = DATA_CANCER.filter(row => row.GeoID == SITE_CONSTANTS.ctaid && row.Years == searchparams.time && row.Cancer == searchparams.site && row.Sex == searchparams.sex)[0];
    const cancerdata_nation = DATA_CANCER.filter(row => row.GeoID == 'US' && row.Years == searchparams.time && row.Cancer == searchparams.site && row.Sex == searchparams.sex)[0];

    let cta_lci, cta_uci, cta_aair;
    let text_cases_cta = '*';
    let text_aair_cta = '*';
    let text_lciuci_cta = '';
    if (cancerdata_cta) {
        const value_cases = searchparams.race ? cancerdata_cta[`${searchparams.race}_Cases`] : cancerdata_cta.Cases;
        const value_aair = searchparams.race ? cancerdata_cta[`${searchparams.race}_AAIR`] : cancerdata_cta.AAIR;
        const value_lci = searchparams.race ? cancerdata_cta[`${searchparams.race}_LCI`] : cancerdata_cta.LCI;
        const value_uci = searchparams.race ? cancerdata_cta[`${searchparams.race}_UCI`] : cancerdata_cta.UCI;

        const has_cases = ! isNaN(parseInt(value_cases));
        const has_aair = ! isNaN(parseFloat(value_cases));

        if (has_cases) text_cases_cta = value_cases.toLocaleString();
        if (has_aair) text_aair_cta = value_aair.toFixed(1);

        if (has_cases && has_aair) {
            const lcitext = (searchparams.race ? cancerdata_cta[`${searchparams.race}_LCI`] : cancerdata_cta.LCI).toFixed(1);
            const ucitext = (searchparams.race ? cancerdata_cta[`${searchparams.race}_UCI`] : cancerdata_cta.UCI).toFixed(1);
            text_lciuci_cta = `(${lcitext}, ${ucitext})`;
        }

        // tacked on months later, a need to stow these for some comparison charts
        cta_aair = value_aair;
        cta_lci = value_lci;
        cta_uci = value_uci;
    }

    let state_lci, state_uci, state_aair;
    let text_cases_state = '*';
    let text_aair_state = '*';
    let text_lciuci_state = '';
    if (cancerdata_state) {
        const value_cases = searchparams.race ? cancerdata_state[`${searchparams.race}_Cases`] : cancerdata_state.Cases;
        const value_aair = searchparams.race ? cancerdata_state[`${searchparams.race}_AAIR`] : cancerdata_state.AAIR;
        const value_lci = searchparams.race ? cancerdata_state[`${searchparams.race}_LCI`] : cancerdata_state.LCI;
        const value_uci = searchparams.race ? cancerdata_state[`${searchparams.race}_UCI`] : cancerdata_state.UCI;

        const has_cases = ! isNaN(parseInt(value_cases));
        const has_aair = ! isNaN(parseFloat(value_cases));

        if (has_cases) text_cases_state = value_cases.toLocaleString();
        if (has_aair) text_aair_state = value_aair.toFixed(1);

        if (has_cases && has_aair) {
            const lcitext = (searchparams.race ? cancerdata_state[`${searchparams.race}_LCI`] : cancerdata_state.LCI).toFixed(1);
            const ucitext = (searchparams.race ? cancerdata_state[`${searchparams.race}_UCI`] : cancerdata_state.UCI).toFixed(1);
            text_lciuci_state = `(${lcitext}, ${ucitext})`;
        }

        // tacked on months later, a need to stow these for some comparison charts
        state_aair = value_aair;
        state_lci = value_lci;
        state_uci = value_uci;
    }

    let nation_lci, nation_uci, nation_aair;
    let text_cases_nation = '*';
    let text_aair_nation = '*';
    let text_lciuci_nation = '';
    if (NATIONWIDE_INCIDENCE && cancerdata_nation) {
        const value_cases = searchparams.race ? cancerdata_nation[`${searchparams.race}_Cases`] : cancerdata_nation.Cases;
        const value_aair = searchparams.race ? cancerdata_nation[`${searchparams.race}_AAIR`] : cancerdata_nation.AAIR;
        const value_lci = searchparams.race ? cancerdata_nation[`${searchparams.race}_LCI`] : cancerdata_nation.LCI;
        const value_uci = searchparams.race ? cancerdata_nation[`${searchparams.race}_UCI`] : cancerdata_nation.UCI;

        const has_cases = ! isNaN(parseInt(value_cases));
        const has_aair = ! isNaN(parseFloat(value_cases));

        if (has_cases) text_cases_nation = value_cases.toLocaleString();
        if (has_aair) text_aair_nation = value_aair.toFixed(1);

        if (has_cases && has_aair) {
            const lcitext = (searchparams.race ? cancerdata_nation[`${searchparams.race}_LCI`] : cancerdata_nation.LCI).toFixed(1);
            const ucitext = (searchparams.race ? cancerdata_nation[`${searchparams.race}_UCI`] : cancerdata_nation.UCI).toFixed(1);
            text_lciuci_nation = `(${lcitext}, ${ucitext})`;
        }

        // tacked on months later, a need to stow these for some comparison charts
        nation_aair = value_aair;
        nation_lci = value_lci;
        nation_uci = value_uci;
    }

    // show/hide the CTA columns (well, actually, each individual cell)
    if (searchparams.ctaid == SITE_CONSTANTS.ctaid) {
        $('#incidence-readouts [data-region="cta"]').hide();
    }
    else {
        $('#incidence-readouts [data-region="cta"]').show();
    }

    // show/hide the Nationwide content based on the NATIONWIDE_INCIDENCE config setting
    if (NATIONWIDE_INCIDENCE) {
        $('#incidence-readouts [data-region="nation"]').show();
    }
    else {
        $('#incidence-readouts [data-region="nation"]').hide();
    }

    // now fill in the blanks
    $('#incidence-readouts span[data-region="cta"][data-statistic="cases"]').text(text_cases_cta);
    $('#incidence-readouts span[data-region="cta"][data-statistic="aair"]').text(text_aair_cta);
    $('#incidence-readouts span[data-region="cta"][data-statistic="lciuci"]').text(text_lciuci_cta);

    $('#incidence-readouts span[data-region="state"][data-statistic="cases"]').text(text_cases_state);
    $('#incidence-readouts span[data-region="state"][data-statistic="aair"]').text(text_aair_state);
    $('#incidence-readouts span[data-region="state"][data-statistic="lciuci"]').text(text_lciuci_state);

    $('#incidence-readouts span[data-region="nation"][data-statistic="cases"]').text(text_cases_nation);
    $('#incidence-readouts span[data-region="nation"][data-statistic="aair"]').text(text_aair_nation);
    $('#incidence-readouts span[data-region="nation"][data-statistic="lciuci"]').text(text_lciuci_nation);

    // part 2
    // tacked on several months later, a candle chart (sort of) for the LCI/UCI/AAIR of these regions
    // but existing candle chart UIs aen't suited, as they want a really custom UI
    const $candlechart_cta = $('#incidence-readouts span.ucilcicandlechart[data-region="cta"]');
    const $candlechart_state = $('#incidence-readouts span.ucilcicandlechart[data-region="state"]');
    const $candlechart_nation = $('#incidence-readouts span.ucilcicandlechart[data-region="nation"]');

    let minlci = (nation_lci && nation_uci) ? Math.min(cta_lci, state_lci, nation_lci) : Math.min(cta_lci, state_lci);
    let maxuci = (nation_lci && nation_uci) ? Math.max(cta_uci, state_uci, nation_uci) : Math.max(cta_uci, state_uci);
    minlci -= 0.2 * (maxuci - minlci);  // pad both sides of the chart slightly
    maxuci += 0.2 * (maxuci - minlci);  // so even very broad CIs have some breathing space
    //minlci *= 0.8;  // an alternative padding mechanism of simply multiplying the LCI and UCI
    //maxuci *= 1.2;  // but if course, this REALLY broadens the range a bit too much

    updateCandleChart($candlechart_cta, 'Selected Area', cta_aair, cta_lci, cta_uci, minlci, maxuci);
    updateCandleChart($candlechart_state, SITE_CONSTANTS.ctaid, state_aair, state_lci, state_uci, minlci, maxuci);
    updateCandleChart($candlechart_nation, 'US', nation_aair, nation_lci, nation_uci, minlci, maxuci);
}


function performSearchIncidenceBarChart (searchparams) {
    const $chart_section  = $('#filters-and-aairbarchart');
    $chart_section.find('span[data-statistic="cancersite"]').text( getLabelFor('site', searchparams.site) );
    $chart_section.find('span[data-statistics="ctaname"]').text(searchparams.ctaname);
    if (searchparams.type == 'County'){
        // const countiesCode = DATA_CTACOUNTY.filter(row => row.ZoneIDOrig == searchparams.ctaid).map(row => row.CountyCode);
        // const county = DATA_CTACOUNTY.filter(row => row.ZoneIDOrig == searchparams.ctaid).map(row => row.County);

        $chart_section.find('span[data-statistics="ctaname"]').text(searchparams.countyName + ' County');
    }

    // incidence chart is multiple rows: filter by CTA+cancer+time, but keep data for all sexes
    // note that we could end up with 0 rows for some of these, e.g. Male Uterine nor Female Prostate, so undefined is a condition to handle
    let incidencedata = DATA_CANCER.filter(row => row.GeoID == searchparams.ctaid && row.Years == searchparams.time && row.Cancer == searchparams.site);
    if (searchparams.type == 'County'){
        incidencedata = DATA_CANCER.filter(row => row.GeoID == searchparams.countyId && row.Years == searchparams.time && row.Cancer == searchparams.site);
    }
    const incidencebysex = {};
    SEARCHOPTIONS_SEX.forEach(function (sexoption) {
        incidencebysex[sexoption.value] = incidencedata.filter(row => row.Sex == sexoption.value)[0];
    });

    // form the chart series for consumption by Highcharts
    // race options form the categories, the sex options form the series
    const barchart_categories = SEARCHOPTIONS_RACE.map(function (raceoption) {
        return getLabelFor('race', raceoption.value);
    });
    const chartseries = SEARCHOPTIONS_SEX.map(function (sexoption) {
        const incidencedatarow = incidencebysex[sexoption.value];  // the data row from above

        const series = {  // Highcharts format: name, color, data[]
            name: sexoption.label,
            color: BARCHART_COLORS_SEX[sexoption.value],
            data: SEARCHOPTIONS_RACE.map(function (raceoption) {  // values in the series, corresponding to the barchart_categories = AAIR for each race option
                if (! incidencedatarow) return 0;  // no data for this sex = return all-0s
                const field = raceoption.value ? `${raceoption.value}_AAIR` : 'AAIR';  // AAIR=total overall incidence; X_AAIR=incidence rate for a given race

                let value = incidencedatarow[field];
                if (! value) value = 0;  // null becomes 0, for hackChartForNullValues()

                return value;
            }),
        };

        return series;
    });

    // chart it!

    // a special hack here, to adjust the barchart's DIV based on SEARCHOPTIONS_RACE
    // to achieve ideal height for the number of categories, without a lot of empty space for deployments with 2-3 races instead of 5-7
    // see also the groupPadding option which affects the spacing between categories
    const $barchartdiv = $('#incidence-barchart');
    var chartheight = 20 + 15 + 15 + 55 * SEARCHOPTIONS_RACE.length;  // top legend + axis labels + credits + (categoryheight * numcategories)
    $barchartdiv.css({
        height: `${chartheight}px`,
    });

    // a special hack here to insert "data not calculated" text any place where data are 0
    // for this dataset, we know that 0 never happens and above we set nulls to be 0 for our purposes
    // we also have data labels so there will be a value label with the text 0 in it
    // the hack is to, after the chart draws, look for these labels that say "0" and replace their text
    // const hackChartForNullValues = function () {
    //     $('#incidence-barchart g.highcharts-data-label tspan').each(function () {
    //         const $this = $(this);

    //         if ($this.text() == '0') {
    //             $this.text('Data cannot be calculated').get(0).classList.add('lighten');
    //         }
    //     });
    // };

    Highcharts.chart('incidence-barchart', {
        chart: {
            type: 'bar',
            // events: {
            //     load: hackChartForNullValues,
            // },
        },
        plotOptions: {
            series: {
                groupPadding: 0.1,
                maxPointWidth: 12,
                animation: {
                    duration: 0
                },
                accessibility: {
                    pointDescriptionFormatter: function (point) {
                        return `${point.category}, ${point.series.name}, AAIR ${point.y}`;
                    },
                },
            },
            bar: {
                dataLabels: {
                    enabled: true,
                    allowOverlap: true,
                    crop: false,
                    overflow: 'none',
                    useHTML: true,
                    formatter: function () {
                        if (this.y === 0 || this.y === null) {
                        return '<span style="font-size: 15px; color: #666; position: relative; top: 5px;">*</span>';
                        } else {
                        return '<span style="font-size: 10px;">' + this.y + '</span>';
                        }
                    },
                },
            },
        },
        legend: {
            layout: 'horizontal',
            floating: true,
            verticalAlign: 'top',
            y: -20,
            symbolRadius: 0,  // square swatches
            itemStyle: {
                fontSize: '18px', // Increase legend font size
                fontWeight: 'bold',
            }
        },
        title: null,
        xAxis: {
            categories: barchart_categories,
            title: {
                text: null
            },
            labels: {
                style: {
                    fontSize: '16px', // Increase x-axis labels size
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: null,
            },
            labels: {
                style: {
                    fontSize: '13px', // Increase x-axis labels size
                }
            }
        },
        tooltip: {
            enabled: true,
            useHTML: true,
            formatter: function () {
                return this.series.name;
            },
            positioner: function (labelWidth, labelHeight, point) {
                return {
                x: point.plotX + this.chart.plotLeft + 40,
                y: point.plotY + this.chart.plotTop - labelHeight / 2
                };
            }
        },
        credits: {
            enabled: true,
        },
        series: chartseries,
    });
}


function performSearchMap (searchparams) {
    MAP.ctapolygonbounds.eachLayer((layer) => {
        layer.setStyle(CHOROPLETH_BORDER_DEFAULT);
    })

    MAP.countypolygonbounds.eachLayer((layer) => {
        layer.setStyle(CHOROPLETH_BORDER_NONE);
    })

    MAP.ctapolygonfills.eachLayer((layer) => { 
        layer.setStyle(Object.assign({}, CHOROPLETH_STYLE_NODATA));
    })

    MAP.countypolygonfills.eachLayer((layer) => { 
        layer.setStyle(Object.assign({}, CHOROPLETH_STYLE_NODATA_CLEAR));
    })

    if (searchparams.type == 'Zone'){

    // if we were given a bbox, zoom to it
    if (searchparams.bbox) {
        MAP.fitBounds(searchparams.bbox);
    }

    // highlight the selected CTA
    MAP.ctapolygonbounds.eachLayer((layer) => {
        const ctaid = layer.feature.properties.ZoneIDOrig;
        const istheone = ctaid == searchparams.ctaid;
        if (istheone) {
            layer.setStyle(CHOROPLETH_BORDER_SELECTED);
            layer.bringToFront();
        }
        else {
            layer.setStyle(CHOROPLETH_BORDER_DEFAULT);
        }
    });

    // if a latlng was given in the search, place the marker
    if (searchparams.latlng) {
        MAP.addressmarker.setLatLng(searchparams.latlng).addTo(MAP);
    }
    else {
        MAP.addressmarker.setLatLng([0, 0]).removeFrom(MAP);
    }

    //
    // PART 2: choropleth
    // the map has a CTA polygons layer, showing all CTAs colored to form a choropleth map
    // the choice of value used to calculate and color, is selected by the custom MAP.choroplethcontrol
    // which doesn't actually do the updating, but provides the UI for selection
    // this-here function is what does the real choropleth work, as well as telling the control to update the legend
    //

    // rank the CTAs by what...
    // depends on that map control; could be incidence data or demographic data
    const rankthemby = MAP.choroplethcontrol.getSelection();
    const vizopt = CHOROPLETH_OPTIONS.filter(function (vizopt) { return vizopt.field == rankthemby; })[0];
    const colors = [ vizopt.colorramp.Q1.fillColor, vizopt.colorramp.Q2.fillColor, vizopt.colorramp.Q3.fillColor, vizopt.colorramp.Q4.fillColor, vizopt.colorramp.Q5.fillColor ];

    // make up a dict of CTA scores for all CTA Zones, ZoneID => score
    const ctascores = {};

    if (['Cases', 'AAIR'].indexOf(rankthemby) != -1) {  // the special case for AAIR/Cases incidence data
        DATA_CANCER
        .filter(row => row.GeoID != 'US')
        .filter(row => row.GeoID != SITE_CONSTANTS.ctaid)
        .filter(row => row.Years == searchparams.time && row.Cancer == searchparams.site && row.Sex == searchparams.sex)
        .forEach((row) => {
            let choropleth_score;
            switch (rankthemby) {
                case 'Cases':
                    choropleth_score = searchparams.race ? row[`${searchparams.race}_Cases`] : row.Cases;
                    break;
                case 'AAIR':
                    choropleth_score = searchparams.race ? row[`${searchparams.race}_AAIR`] : row.AAIR;
                    break;
            }
            ctascores[row.GeoID] = choropleth_score;
        });
    }
    else {  // demographic data
        DATA_DEMOGS
        .filter(row => row.GeoID != 'US')
        .filter(row => row.GeoID != SITE_CONSTANTS.ctaid)  // only 1 demog row per CTZ Zone, so only filtering is Not Statewide
        .forEach((row) => {
            const choropleth_score = row[rankthemby];  // the control's selected value = a CHOROPLETH_OPTIONS "field" = a literal CSV column name
            ctascores[row.GeoID] = choropleth_score;
        });
    }
    // find the min and max, and send it to the control for display
    const allscores = Object.values(ctascores).filter(function (score) { return score; });
    const scoringmin = Math.min(...allscores);
    const scoringmax = Math.max(...allscores);
    const legendformat = CHOROPLETH_OPTIONS.filter(function (vizopt) { return vizopt.field == rankthemby; })[0].format;
    const scoremintext = scoringmin == Infinity ? 'No Data' : formatFieldValue(scoringmin, legendformat);
    const scoremaxtext = scoringmax == -Infinity ? 'No Data' : formatFieldValue(scoringmax, legendformat);
    MAP.choroplethcontrol.setMinMax(scoremintext, scoremaxtext);

    // update the color ramp gradient in the control
    MAP.choroplethcontrol.setGradientColors(colors);

    // find quantiles to make up 5 classes, for use in the choropleth assignments coming up
    // thanks to buboh at https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
    const asc = arr => arr.sort((a, b) => a - b);
    const quantile = (arr, q) => {
        const sorted = asc(arr);
        const pos = ((sorted.length) - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if ((sorted[base + 1] !== undefined)) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    };

    const q1brk = quantile(allscores, .20);
    const q2brk = quantile(allscores, .40);
    const q3brk = quantile(allscores, .60);
    const q4brk = quantile(allscores, .80);

    // assign the color/style to each CTA Zone polygon
    MAP.ctapolygonfills.eachLayer((layer) => {
        // const ctaid = layer.feature.properties.Zone;
        const ctaid = layer.feature.properties.ZoneIDOrig;
        const score = ctascores[ctaid];
        let style;
        if (score == null || score == undefined || score == "") {
            style = Object.assign({}, CHOROPLETH_STYLE_NODATA);
        }
        else {
            let bucket = 'Q5';
            if (score <= q1brk) bucket = 'Q1';
            else if (score <= q2brk) bucket = 'Q2';
            else if (score <= q3brk) bucket = 'Q3';
            else if (score <= q4brk) bucket = 'Q4';

            style = Object.assign({}, vizopt.colorramp[bucket]);  // take a copy!
        }

        layer.setStyle(style);
    });
    } else if (searchparams.type == "County") {
        
    // if we were given a bbox, zoom to it
    if (searchparams.bbox) {
        MAP.fitBounds(searchparams.bbox);
    }

    // clear the zone borders
    MAP.ctapolygonbounds.eachLayer((layer) => {
        layer.setStyle({ color: null });
    })

    // highlight the selected CTA
    MAP.countypolygonbounds.eachLayer((layer) => {
        // const ctaid = layer.feature.properties.Zone;
        // const ctaid = layer.feature.properties.ZoneIDOrig;
        const ctaid = layer.feature.properties.GEOID;
        const istheone = ctaid == searchparams.countyId;
        if (istheone) {
            layer.setStyle(CHOROPLETH_BORDER_SELECTED);
            layer.bringToFront();
        }
        else {
            layer.setStyle(CHOROPLETH_BORDER_DEFAULT);
        }
    });

    // if a latlng was given in the search, place the marker
    if (searchparams.latlng) {
        MAP.addressmarker.setLatLng(searchparams.latlng).addTo(MAP);
    }
    else {
        MAP.addressmarker.setLatLng([0, 0]).removeFrom(MAP);
    }

    //
    // PART 2: choropleth
    // the map has a CTA polygons layer, showing all CTAs colored to form a choropleth map
    // the choice of value used to calculate and color, is selected by the custom MAP.choroplethcontrol
    // which doesn't actually do the updating, but provides the UI for selection
    // this-here function is what does the real choropleth work, as well as telling the control to update the legend
    //

    // rank the CTAs by what...
    // depends on that map control; could be incidence data or demographic data
    const rankthemby = MAP.choroplethcontrol.getSelection();
    const vizopt = CHOROPLETH_OPTIONS.filter(function (vizopt) { return vizopt.field == rankthemby; })[0];
    const colors = [ vizopt.colorramp.Q1.fillColor, vizopt.colorramp.Q2.fillColor, vizopt.colorramp.Q3.fillColor, vizopt.colorramp.Q4.fillColor, vizopt.colorramp.Q5.fillColor ];

    // make up a dict of CTA scores for all CTA Zones, ZoneID => score
    const ctascores = {};

    if (['Cases', 'AAIR'].indexOf(rankthemby) != -1) {  // the special case for AAIR/Cases incidence data
        DATA_CANCER
        .filter(row => row.GeoID != 'US')
        .filter(row => row.GeoID != SITE_CONSTANTS.ctaid)
        .filter(row => row.Years == searchparams.time && row.Cancer == searchparams.site && row.Sex == searchparams.sex)
        .forEach((row) => {
            let choropleth_score;
            switch (rankthemby) {
                case 'Cases':
                    choropleth_score = searchparams.race ? row[`${searchparams.race}_Cases`] : row.Cases;
                    break;
                case 'AAIR':
                    choropleth_score = searchparams.race ? row[`${searchparams.race}_AAIR`] : row.AAIR;
                    break;
            }
            ctascores[row.GeoID] = choropleth_score;
        });
    }
    else {  // demographic data
        DATA_DEMOGS
        .filter(row => row.GeoID != 'US')
        .filter(row => row.GeoID != SITE_CONSTANTS.ctaid)  // only 1 demog row per CTZ Zone, so only filtering is Not Statewide
        .forEach((row) => {
            const choropleth_score = row[rankthemby];  // the control's selected value = a CHOROPLETH_OPTIONS "field" = a literal CSV column name
            ctascores[row.GeoID] = choropleth_score;
        });
    }
    const filteredDataWithoutZones = Object.fromEntries(
        Object.entries(ctascores).filter(([key, value]) => !key.includes("A"))
    );
    // find the min and max, and send it to the control for display
    const allscores = Object.values(filteredDataWithoutZones).filter(function (score) { return score; });
    const scoringmin = Math.min(...allscores);
    const scoringmax = Math.max(...allscores);
    const legendformat = CHOROPLETH_OPTIONS.filter(function (vizopt) { return vizopt.field == rankthemby; })[0].format;
    const scoremintext = scoringmin == Infinity ? 'No Data' : formatFieldValue(scoringmin, legendformat);
    const scoremaxtext = scoringmax == -Infinity ? 'No Data' : formatFieldValue(scoringmax, legendformat);
    MAP.choroplethcontrol.setMinMax(scoremintext, scoremaxtext);

    // update the color ramp gradient in the control
    MAP.choroplethcontrol.setGradientColors(colors);

    // find quantiles to make up 5 classes, for use in the choropleth assignments coming up
    // thanks to buboh at https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
    const asc = arr => arr.sort((a, b) => a - b);
    const quantile = (arr, q) => {
        const sorted = asc(arr);
        const pos = ((sorted.length) - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if ((sorted[base + 1] !== undefined)) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    };

    const q1brk = quantile(allscores, .20);
    const q2brk = quantile(allscores, .40);
    const q3brk = quantile(allscores, .60);
    const q4brk = quantile(allscores, .80);

    // assign the color/style to each CTA Zone polygon
    MAP.countypolygonfills.eachLayer((layer) => {
        // const ctaid = layer.feature.properties.Zone;
        // const ctaid = layer.feature.properties.ZoneIDOrig;
        const ctaid = layer.feature.properties.GEOID;
        const score = ctascores[ctaid];
        let style;
        if (score == null || score == undefined || score == "") {
            style = Object.assign({}, CHOROPLETH_STYLE_NODATA);
        }
        else {
            let bucket = 'Q5';
            if (score <= q1brk) bucket = 'Q1';
            else if (score <= q2brk) bucket = 'Q2';
            else if (score <= q3brk) bucket = 'Q3';
            else if (score <= q4brk) bucket = 'Q4';

            style = Object.assign({}, vizopt.colorramp[bucket]);  // take a copy!
        }

        layer.setStyle(style);
    });
    }

}


function performSearchUpdateDataDownloadLinks (searchparams) {
    const $downloadlink = $('#downloadoptions a[data-export="zonedata"]');

    if (searchparams.ctaid == SITE_CONSTANTS.ctaid) {
        $downloadlink.hide().prop('href', 'javascript:void(0);');
    }
    else {
        const zipfilename = `zone_${searchparams.ctaid}.zip`;
        const zipurl = `static/downloads/${zipfilename}`;
        $downloadlink.show().prop('href', zipurl).attr('data-ctaid', searchparams.ctaid);
    }
}


function geocodeAddress(address, callback) {
  const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

  // If it's already lat,lng coordinates
  const islatlng = address.match(/\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*/);
  if (islatlng) {
    const coordinates = [parseFloat(islatlng[1]), parseFloat(islatlng[2])];
    return callback(coordinates);
  }

  // Cached results
  if (GEOCODE_CACHE[address]) {
    return callback(GEOCODE_CACHE[address]);
  }

  if (!MAPBOX_ACCESS_TOKEN) {
    alert("Cannot look up addresses because MAPBOX_ACCESS_TOKEN has not been set.");
    return;
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;

  $.ajax({
    url: url,
    dataType: 'json',
    success: function(data) {
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].center;
        const coordinates = [lat, lon];
        GEOCODE_CACHE[address] = coordinates;
        callback(coordinates);
      } else {
        callback(null);
      }
    },
    error: function(xhr, status, error) {
      console.error('Error fetching geocode data:', error);
      alert("There was a problem finding that address. Please try again.");
    }
  });
}


function getLabelFor (fieldname, value) {
    // utility function: examine the given SELECT element and find the text for the given value
    // thus the pickers' options become the source of truth for labeling these
    // which we do in a bunch of places: bar chart series, text readouts demographic readouts, ...

    const $picker = $(`div.data-filters select[name="${fieldname}"]`);
    const $option = $picker.find(`option[value="${value}"]`);
    const labeltext = $option.text();

    return labeltext;
}


function getOptionCount (fieldname) {
    const $picker = $(`div.data-filters select[name="${fieldname}"]`);
    const $options = $picker.find('option');
    return $options.length;
}


function compileParams (addextras=false) {
    const $searchwidgets = $('div.data-filters input[type="text"], div.data-filters select');

    // these params are always present: the core search params
    const params = {
        type: $searchwidgets.filter('[name="type"]').val(),
        address: $searchwidgets.filter('[name="address"]').val(),
        sex: $searchwidgets.filter('[name="sex"]').val(),
        site: $searchwidgets.filter('[name="site"]').val(),
        race: $searchwidgets.filter('[name="race"]').val(),
        time: $searchwidgets.filter('[name="time"]').val(),
    };

    // these are only used for some weird cases such as URL params not for searching
    if (addextras) {
        params.overlays = MAP.layerpicker.getLayerStates()
            .filter(layerinfo => layerinfo.checked)
            .map(layerinfo => layerinfo.id)
            .join(',');
        if (! params.overlays) params.overlays = 'none';  // so we always have something, even if it's all layers off

        params.choropleth = MAP.choroplethcontrol.getSelection();
    }

    // done
    return params;
}

function updateUrlParams () {
    const baseurl = document.location.href.indexOf('?') == -1 ? document.location.href : document.location.href.substr(0, document.location.href.indexOf('?'));
    const params = compileParams(true);
    const url = baseurl + '?' + jQuery.param(params);
    window.history.replaceState({}, '', url);
}


function findCTAContainingLatLng (inputlatlng) {
    const latlng = inputlatlng.hasOwnProperty('length') ? L.latLng(inputlatlng[0], inputlatlng[1]) : inputlatlng;
    const containingcta = leafletPip.pointInLayer(latlng, MAP.ctapolygonfills);
    return containingcta[0];
}

function findCountyContainingLatLng (inputlatlng) {
    const latlng = inputlatlng.hasOwnProperty('length') ? L.latLng(inputlatlng[0], inputlatlng[1]) : inputlatlng;
    const containingCounty = leafletPip.pointInLayer(latlng, MAP.countypolygonfills);
    return containingCounty[0];
}


function findCTAById (ctaid) {
    const targetcta = MAP.ctapolygonfills.getLayers().filter(function (layer) {
        // return layer.feature.properties.Zone == ctaid;
        return layer.feature.properties.ZoneIDOrig == ctaid;

    });
    return targetcta[0];
}


function toggleAddressSearchFailure (message) {
    const $textarea = $('div.data-filters label[for="data-filters-address"] span');

    if (message) {
        $textarea.text(message).removeClass('d-none');
    }
    else {
        $textarea.text('').addClass('d-none');
    }
}


// Google Analytics wrapper cuz we log a whole lot of small actions such as clickers being clicked
function logGoogleAnalyticsEvent (type, subtype, detail) {
    // console.debug([ 'Google Analytics Event', type, subtype, detail]);

    if (typeof gtag !== 'function') return;  // they may not have it set up

    gtag('event', type, {
        'event_category': subtype,
        'event_label': detail,
    });
}


function formatFieldValue (value, format) {
    // try not to convert and format null/undefined; JS will format null as the string "null" which is silly
    if ( value === null || value === undefined || value === 'NoData') return "";

    let formatted;
    switch (format) {
        case 'text':
            formatted = value;
            break;
        case 'integer':
            formatted = parseInt(Math.round(value));
            formatted = ! isNaN(formatted) ? formatted.toLocaleString() : '-';
            break;
        case 'float':
            formatted = parseFloat(value);
            formatted = ! isNaN(formatted) ? formatted.toFixed(1) : '-';
            break;
        case 'percent':
            formatted = parseFloat(value);
            formatted = ! isNaN(formatted) ? (formatted < 1 ? '< 1' : formatted.toFixed(1)) : '-';
            formatted = `${formatted} %`;
            break;
        case 'money':
            formatted = parseInt(Math.round(value));
            formatted = ! isNaN(formatted) ? '$' + formatted.toLocaleString() : '-';
            break;
        case 'phone':
            formatted = value ? `<a target="_blank" href="tel:${value}">${value}</a>` : '-';
            break;
        case 'email':
            formatted = value ? `<a target="_blank" href="mailto:${value}">${value}</a>` : '-';
            break;
        case 'url':
            formatted = value ? (value.toLowerCase().substr(0, 4) == 'http' ? value : `http://${value}`) : null;
            formatted = value ? `<a target="_blank" href="${formatted}">Open Website <i class="fa fa-external-link-square"></i></a>` : '-';
            break;
        default:
            throw `formatFieldValue() got unexpected format type ${format}`;
    }

    return formatted;
}


function updateCandleChart($candlediv, subtitle, aair, lci, uci, minlci, maxuci) {
    // create the new contents
    // - thin line for the full range, always 100% width
    // - thicker line for the LCI/UCI range in this area, with its width scaled to the full range of min/max LCI/UCI
    // - point for the AAIR, with its position scaled to the full range of min/max LCI/UCI
    $candlediv.empty();
    const $fullrangeline = $('<span class="fullrangeline"></span>').appendTo($candlediv);
    const $ucilcirangeline = $('<span class="ucilcirangeline"></span>').appendTo($candlediv);
    const $aairpoint = $('<span class="aairpoint"></span>').appendTo($candlediv);

    // the span.ucilcicandlechart CSS defines the thickness and colors, and their absolute positioning
    // $fullrangeline is always 100% across, so no work needed
    // $ucilcirangeline needs its width and left scaled, to indicate lci & uci along the range of minlci & maxuci
    // $aairpoint needs its left scaled so its center (depends on the width) indicates the AAIR along the range of minlci & maxuci

    const fullcirange = maxuci - minlci;

    const aairpointradius = 5;  // see span.aairpoint, its WxH hould be 1+2*radius
    const aairleftpercent = 100 * (aair - minlci) / fullcirange;
    $aairpoint.css({
        left: `calc(${aairleftpercent}% - ${aairpointradius}px)`,
    });

    const cirangeidthpercent = 100 * (uci - lci) / fullcirange;
    const cirangeleftpercent = 100 * (lci - minlci) / fullcirange;
    $ucilcirangeline.css({
        width: `${cirangeidthpercent}%`,
        left: `${cirangeleftpercent}%`,
    });

    // some accessibility and user-friendliness touches
    const charttooltip = `${subtitle} LCI ${lci}, UCI ${uci}, AAIR ${aair}`;
    $candlediv.attr('aria-label', charttooltip).prop('title', charttooltip);
}

function downloadDataAsZip() {
    const zip = new JSZip();

    // List of data files you want to zip
    const files = [
        'allCancerRatesData.csv',
        'allDemographics.csv',
        'cities_by_cta.csv', 
        'counties_by_cta.csv'
    ];

    const filePromises = files.map(filename => {
        return fetch(`./static/data/${filename}`)
            .then(response => response.blob())
            .then(blob => {
                zip.file(filename, blob);
            });
    });

    Promise.all(filePromises).then(() => {
        zip.generateAsync({ type: "blob" }).then(function (content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "data-files.zip"; // Name of the zip file
            link.click();
        });
    });
}

// Attach event listener to the download link
document.addEventListener("DOMContentLoaded", function () {
    const downloadLink = document.querySelector('[data-export="data"]');

    downloadLink.addEventListener("click", function () {
        downloadDataAsZip();
    });
});