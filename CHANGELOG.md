## [57.2.0](https://github.com/Gisat/ptr-fe-core/compare/v57.1.0...v57.2.0) (2026-04-20)

### Features

* updated docs and remove local logs ([d8fe1b0](https://github.com/Gisat/ptr-fe-core/commit/d8fe1b0bf5e6e86deddbb8a8aa73f03d154923af))

## [57.1.0](https://github.com/Gisat/ptr-fe-core/compare/v57.0.2...v57.1.0) (2026-04-17)

### Features

* Merge pull request [#138](https://github.com/Gisat/ptr-fe-core/issues/138) from Gisat/update-mantine ([433ea8f](https://github.com/Gisat/ptr-fe-core/commit/433ea8f1a5b75dc2855cc166e2711bc73a6814e6))

### Bug Fixes

* Update Mantine ([276c633](https://github.com/Gisat/ptr-fe-core/commit/276c633bad62c99e8cdd434e234780fc5bb9b05f))

## [57.0.2](https://github.com/Gisat/ptr-fe-core/compare/v57.0.1...v57.0.2) (2026-04-16)

### Bug Fixes

* enable tooltips conditionally based on interactivity for COG and GeoJSON layers ([32a4544](https://github.com/Gisat/ptr-fe-core/commit/32a4544190f09d767830b3c67df24e634edba935))
* remove interactivity condition for tooltip enabling in GeoJSON and Icon layers ([73f514e](https://github.com/Gisat/ptr-fe-core/commit/73f514ec6e7979696c1b25dd4f8ef6a7078a14af))

## [57.0.1](https://github.com/Gisat/ptr-fe-core/compare/v57.0.0...v57.0.1) (2026-04-14)

### Bug Fixes

* update axios to version 1.15.0 ([4b4697d](https://github.com/Gisat/ptr-fe-core/commit/4b4697d965de4e79b16ba478ba9adc3fa1dccc22))

## [57.0.0](https://github.com/Gisat/ptr-fe-core/compare/v56.4.1...v57.0.0) (2026-04-14)

### ⚠ BREAKING CHANGES

* update @gisatcz/ptr-be-core to version 57.0.0

### Features

* update @gisatcz/ptr-be-core to version 57.0.0 ([ae9bb85](https://github.com/Gisat/ptr-fe-core/commit/ae9bb853b3cb3f997c472a8f371af3d25bee301d))

### Bug Fixes

* ensure all semantic-release plugins are explicitly provided via npx --package ([c127b02](https://github.com/Gisat/ptr-fe-core/commit/c127b023ab1a9927a60324844115ec01f2967af1))
* update GitHub Actions token creation and semantic-release config ([f574a2a](https://github.com/Gisat/ptr-fe-core/commit/f574a2ac919a70ec497bc0841fcd555f0868c7ea))

## [56.4.1](https://github.com/Gisat/ptr-fe-core/compare/v56.4.0...v56.4.1) (2026-04-13)


### Bug Fixes

* update dependencies to fix critical issues and remove unused packages ([979f165](https://github.com/Gisat/ptr-fe-core/commit/979f16576bd81a934297fee9afd936d6506a7105))

# [56.4.0](https://github.com/Gisat/ptr-fe-core/compare/v56.3.0...v56.4.0) (2026-04-09)


### Features

* story step switcher ([064dc13](https://github.com/Gisat/ptr-fe-core/commit/064dc1387c20dfc8de5c4a0758108e9f4cd6a1b4))

# [56.3.0](https://github.com/Gisat/ptr-fe-core/compare/v56.2.0...v56.3.0) (2026-04-02)


### Features

* geometry drawing ([f48f720](https://github.com/Gisat/ptr-fe-core/commit/f48f7205a3215a3f8163de45d4609a4c20bf101b))

# [56.2.0](https://github.com/Gisat/ptr-fe-core/compare/v56.1.0...v56.2.0) (2026-04-01)


### Features

* add dev branch pre-release and update CI triggers ([9635089](https://github.com/Gisat/ptr-fe-core/commit/9635089cf9340171b2287ab9eb2401216d6faec7))

# [56.1.0](https://github.com/Gisat/ptr-fe-core/compare/v56.0.4...v56.1.0) (2026-04-01)


### Bug Fixes

* add DEPLOY_KEY for git operations in release workflow ([8da81b8](https://github.com/Gisat/ptr-fe-core/commit/8da81b884283606b572fc6e77cf53905d2b7cb37))
* use recommended npx --package approach for semantic-release and plugins ([bf66c2b](https://github.com/Gisat/ptr-fe-core/commit/bf66c2b6dc8d922b5eca9464d1366645685025b6))
* validate channelIndex and clamp UV bounds in readCogPixelValues; guard useChannel in getCogNativeTooltip ([3ed54ec](https://github.com/Gisat/ptr-fe-core/commit/3ed54ec2467b91a6cb2e32a831220d0f2e1775fe))


### Features

* add pixel value tooltip support for COG layers and enhance tooltip handling ([bf36490](https://github.com/Gisat/ptr-fe-core/commit/bf364902d9716dd6efe1a093f064bd8619b58ee3))
* add tooltip settings to pixel info and layer tooltip parameters ([49a6486](https://github.com/Gisat/ptr-fe-core/commit/49a648659ce28519bf816383291e58adfc53666d))
* enhance COG value retrieval and tooltip functionality with channel selection ([ae05a0a](https://github.com/Gisat/ptr-fe-core/commit/ae05a0a2700699048b67ca75324ca2583c232ba5))
* implement native tooltip functionality for COG layers and refactor tooltip handling ([5541506](https://github.com/Gisat/ptr-fe-core/commit/5541506805f99636437a0d9c9fe87b74afa7dae1))
* implement native tooltip support for COG layers and refactor tooltip handling ([58f1f54](https://github.com/Gisat/ptr-fe-core/commit/58f1f545a9762f4cf0bfd54b588c0bdf1535ccc0))
* refactor tooltip handling and modularize tooltip logic for COG and vector layers - step 1, 2 ([464ce41](https://github.com/Gisat/ptr-fe-core/commit/464ce41b43e73ba996a4078cdf700bb2dbe51ba2))
