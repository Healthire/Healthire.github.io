
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'assets', true, true);
Module['FS_createPath']('/assets', 'animations', true, true);
Module['FS_createPath']('/assets', 'images', true, true);
Module['FS_createPath']('/', 'fonts', true, true);
Module['FS_createPath']('/', 'suit', true, true);
Module['FS_createPath']('/', 'util', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 1109, "filename": "/altar.lua"}, {"audio": 0, "start": 1109, "crunched": 0, "end": 1284, "filename": "/conf.lua"}, {"audio": 0, "start": 1284, "crunched": 0, "end": 4385, "filename": "/emitters.lua"}, {"audio": 0, "start": 4385, "crunched": 0, "end": 24079, "filename": "/game.lua"}, {"audio": 0, "start": 24079, "crunched": 0, "end": 25632, "filename": "/main.lua"}, {"audio": 0, "start": 25632, "crunched": 0, "end": 31659, "filename": "/minion.lua"}, {"audio": 0, "start": 31659, "crunched": 0, "end": 34030, "filename": "/phylactery.lua"}, {"audio": 0, "start": 34030, "crunched": 0, "end": 36480, "filename": "/soul.lua"}, {"audio": 0, "start": 36480, "crunched": 0, "end": 37686, "filename": "/assets/animations/minion.lua"}, {"audio": 0, "start": 37686, "crunched": 0, "end": 38259, "filename": "/assets/animations/minion.png"}, {"audio": 0, "start": 38259, "crunched": 0, "end": 38652, "filename": "/assets/animations/phylactery.lua"}, {"audio": 0, "start": 38652, "crunched": 0, "end": 39352, "filename": "/assets/animations/phylactery.png"}, {"audio": 0, "start": 39352, "crunched": 0, "end": 39879, "filename": "/assets/images/altar.png"}, {"audio": 0, "start": 39879, "crunched": 0, "end": 39949, "filename": "/assets/images/altar_particle.png"}, {"audio": 0, "start": 39949, "crunched": 0, "end": 48023, "filename": "/assets/images/background.png"}, {"audio": 0, "start": 48023, "crunched": 0, "end": 48134, "filename": "/assets/images/blood.png"}, {"audio": 0, "start": 48134, "crunched": 0, "end": 48214, "filename": "/assets/images/hover_particle.png"}, {"audio": 0, "start": 48214, "crunched": 0, "end": 48447, "filename": "/assets/images/minions_icon.png"}, {"audio": 0, "start": 48447, "crunched": 0, "end": 48534, "filename": "/assets/images/minion_shadow.png"}, {"audio": 0, "start": 48534, "crunched": 0, "end": 48680, "filename": "/assets/images/obelisk_1.png"}, {"audio": 0, "start": 48680, "crunched": 0, "end": 48884, "filename": "/assets/images/obelisk_2.png"}, {"audio": 0, "start": 48884, "crunched": 0, "end": 49298, "filename": "/assets/images/obelisk_3.png"}, {"audio": 0, "start": 49298, "crunched": 0, "end": 49740, "filename": "/assets/images/obelisk_4.png"}, {"audio": 0, "start": 49740, "crunched": 0, "end": 49956, "filename": "/assets/images/phylactery_icon.png"}, {"audio": 0, "start": 49956, "crunched": 0, "end": 50930, "filename": "/assets/images/pit.png"}, {"audio": 0, "start": 50930, "crunched": 0, "end": 51016, "filename": "/assets/images/praise.png"}, {"audio": 0, "start": 51016, "crunched": 0, "end": 51185, "filename": "/assets/images/praise_icon.png"}, {"audio": 0, "start": 51185, "crunched": 0, "end": 51310, "filename": "/assets/images/soul.png"}, {"audio": 0, "start": 51310, "crunched": 0, "end": 51422, "filename": "/assets/images/soulsmoke.png"}, {"audio": 0, "start": 51422, "crunched": 0, "end": 51623, "filename": "/assets/images/souls_icon.png"}, {"audio": 0, "start": 51623, "crunched": 0, "end": 51730, "filename": "/assets/images/spatter.png"}, {"audio": 0, "start": 51730, "crunched": 0, "end": 52097, "filename": "/assets/images/spawn1.png"}, {"audio": 0, "start": 52097, "crunched": 0, "end": 52471, "filename": "/assets/images/spawn10.png"}, {"audio": 0, "start": 52471, "crunched": 0, "end": 52850, "filename": "/assets/images/spawn10hover.png"}, {"audio": 0, "start": 52850, "crunched": 0, "end": 53240, "filename": "/assets/images/spawn10press.png"}, {"audio": 0, "start": 53240, "crunched": 0, "end": 53610, "filename": "/assets/images/spawn1hover.png"}, {"audio": 0, "start": 53610, "crunched": 0, "end": 53983, "filename": "/assets/images/spawn1press.png"}, {"audio": 0, "start": 53983, "crunched": 0, "end": 846731, "filename": "/fonts/cour.ttf"}, {"audio": 0, "start": 846731, "crunched": 0, "end": 847452, "filename": "/suit/button.lua"}, {"audio": 0, "start": 847452, "crunched": 0, "end": 848302, "filename": "/suit/checkbox.lua"}, {"audio": 0, "start": 848302, "crunched": 0, "end": 853027, "filename": "/suit/core.lua"}, {"audio": 0, "start": 853027, "crunched": 0, "end": 854408, "filename": "/suit/imagebutton.lua"}, {"audio": 0, "start": 854408, "crunched": 0, "end": 857186, "filename": "/suit/init.lua"}, {"audio": 0, "start": 857186, "crunched": 0, "end": 861035, "filename": "/suit/input.lua"}, {"audio": 0, "start": 861035, "crunched": 0, "end": 861755, "filename": "/suit/label.lua"}, {"audio": 0, "start": 861755, "crunched": 0, "end": 870835, "filename": "/suit/layout.lua"}, {"audio": 0, "start": 870835, "crunched": 0, "end": 872141, "filename": "/suit/license.txt"}, {"audio": 0, "start": 872141, "crunched": 0, "end": 874106, "filename": "/suit/README.md"}, {"audio": 0, "start": 874106, "crunched": 0, "end": 875768, "filename": "/suit/slider.lua"}, {"audio": 0, "start": 875768, "crunched": 0, "end": 880441, "filename": "/suit/theme.lua"}, {"audio": 0, "start": 880441, "crunched": 0, "end": 883497, "filename": "/util/animation.lua"}, {"audio": 0, "start": 883497, "crunched": 0, "end": 883725, "filename": "/util/assets.lua"}, {"audio": 0, "start": 883725, "crunched": 0, "end": 885257, "filename": "/util/camera.lua"}, {"audio": 0, "start": 885257, "crunched": 0, "end": 886749, "filename": "/util/debug_log.lua"}, {"audio": 0, "start": 886749, "crunched": 0, "end": 887382, "filename": "/util/enum.lua"}, {"audio": 0, "start": 887382, "crunched": 0, "end": 888437, "filename": "/util/fps_counter.lua"}, {"audio": 0, "start": 888437, "crunched": 0, "end": 889346, "filename": "/util/math.lua"}, {"audio": 0, "start": 889346, "crunched": 0, "end": 891157, "filename": "/util/poly.lua"}, {"audio": 0, "start": 891157, "crunched": 0, "end": 894988, "filename": "/util/rect.lua"}, {"audio": 0, "start": 894988, "crunched": 0, "end": 895629, "filename": "/util/state_machine.lua"}, {"audio": 0, "start": 895629, "crunched": 0, "end": 900410, "filename": "/util/tilemap.lua"}, {"audio": 0, "start": 900410, "crunched": 0, "end": 907645, "filename": "/util/util.lua"}, {"audio": 0, "start": 907645, "crunched": 0, "end": 910621, "filename": "/util/vec2.lua"}], "remote_package_size": 910621, "package_uuid": "2554288c-1032-4850-8662-9b19e260dac1"});

})();
