*** Begin Patch
*** Update File: server/index.js
@@
 import mobaAssetsRouter from './moba-assets.js'
+import mobaArenasRouter from './moba-arenas.js'
@@
   app.use('/api/internal', mobaAssetsRouter)
+  app.use('/api/guru/moba/arenas', mobaArenasRouter)
   app.use('/local-moba-assets', express.static(path.resolve(process.cwd(), 'local_moba_assets')))
*** End Patch
