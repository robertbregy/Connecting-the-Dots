(function(){
const D=window.DOT_DATA;
D.geoExamples=(D.geoExamples||[]).map(x=>x.name==='.zuerich'?Object.assign({},x,{place:'Canton of Zurich',kind:'canton'}):x);
Object.assign(D,{"geoApplicantRegions2012": [{"name": "North America", "code": "NA", "count": 911, "lat": 43, "lon": -100}, {"name": "Europe", "code": "EUR", "count": 675, "lat": 50, "lon": 15}, {"name": "Asia-Pacific", "code": "AP", "count": 303, "lat": 22, "lon": 110}, {"name": "Latin America & Caribbean", "code": "LAC", "count": 24, "lat": -15, "lon": -60}, {"name": "Africa", "code": "AF", "count": 17, "lat": 5, "lon": 20}], "metricSources": {"2026": "https://www.icann.org/en/announcements/details/icann-confirms-number-of-applications-proceeding-in-the-2026-round-22-09-2026-en", "2012": "https://newgtlds.icann.org/en/program-status/statistics", "geo2012": "https://www.icann.org/en/announcements/details/new-gtld-reveal-day---applied-for-strings-13-6-2012-en"}});
})();
