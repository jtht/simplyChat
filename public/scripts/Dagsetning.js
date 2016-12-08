(function() {
  var DAGAR = [
    'Sunnudagur',
    'Mánudagur',
    'Þriðjudagur',
    'Miðvikudagur',
    'Fimmtudagur',
    'Föstudagur',
    'Laugardagur'
  ];

  var MANUDIR = [
    'janúar',
    'febrúar',
    'mars',
    'apríl',
    'maí',
    'júní',
    'júlí',
    'ágúst',
    'september',
    'október',
    'nóvember',
    'desember'
  ];

  function Dagsetning(date) {
    this.oDate = new Date(parseInt(date));
    this.dagur = DAGAR[this.oDate.getDay()];
    this.manudur = MANUDIR[this.oDate.getMonth()];
    this.dagsetning = this.oDate.getDate();
    this.ar = this.oDate.getFullYear();
  }

  Dagsetning.prototype.toString = function () {
    return this.dagur + ", " + this.dagsetning +
           ". " + this.manudur + " " + this.ar;
  };

  window.Dagsetning = Dagsetning;
})();
