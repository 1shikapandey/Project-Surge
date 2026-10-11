export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'te';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '' },
];

export interface TranslationSchema {
  nav: {
    brand: string;
    subTitle: string;
    backToLanding: string;
    openMeteoApi: string;
    liveWeather: string;
    maxDepth: string;
    reportWater: string;
    authorityCenter: string;
    authorityPortal: string;
    selectCity: string;
    selectEvent: string;
    lakes7: string;
    reservoirs5: string;
    yamunaStage: string;
  };
  landing: {
    fullForm: string;
    citizenDashboardBtn: string;
    leadTimeBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    metricLeadTime: string;
    metricHydraulics: string;
    metricPrecision: string;
    metricDetours: string;
    metricLeadTimeSub: string;
    metricHydraulicsSub: string;
    metricPrecisionSub: string;
    metricDetoursSub: string;
    selectCityTitle: string;
    selectCitySub: string;
    liveRadar: string;
    highRiskHotspots: string;
    authorityLoginDomain: string;
    launchDashboard: string;
    authorityLoginBtn: string;
    simTitle: string;
    simSub: string;
    simRainRate: string;
    moderate: string;
    heavy: string;
    cloudburst: string;
    predictedDepth: string;
    underpassLocation: string;
    capacityExceeded: string;
    capacityAdequate: string;
    faqTitle: string;
    faqBadge: string;
    faqMainHeading: string;
    footerTitle: string;
    footerSub: string;
    feature1Title: string;
    feature1Sub: string;
    feature2Title: string;
    feature2Sub: string;
    feature3Title: string;
    feature3Sub: string;
  };
  faqs: Array<{ q: string; a: string }>;
  routing: {
    title: string;
    subTitle: string;
    originPlaceholder: string;
    destPlaceholder: string;
    pickOrigin: string;
    pickDest: string;
    pinned: string;
    carSedan: string;
    ambulance: string;
    autoBike: string;
    pedestrian: string;
    findRoute: string;
    calculating: string;
    distance: string;
    eta: string;
    riskScore: string;
    riskSafe: string;
    riskModerate: string;
    riskHigh: string;
    riskImpassable: string;
    turnByTurn: string;
    noRouteFound: string;
    pickLocationPrompt: string;
    clearRoute: string;
    vehicleProfileClearance: string;
    maxSafe: string;
    hatchback: string;
    suv: string;
    bus: string;
    realRoadSafeRoute: string;
    noSafeRouteFor: string;
    selectHazardZone: string;
    nearestShelter: string;
    rescueVehicleRoute: string;
  };
  alerts: {
    title: string;
    subTitle: string;
    tabAll: string;
    tabInundation: string;
    tabSurcharge: string;
    tabReports: string;
    critical: string;
    warning: string;
    advisory: string;
    helplineTitle: string;
    ndrfHelpline: string;
    controlRoom: string;
    disasterLine: string;
    reportedAgo: string;
    verified: string;
    unverified: string;
    borough: string;
    elevation: string;
    overcapacity: string;
    surfaceSpill: string;
    hydraulicBackflow: string;
    noAlerts: string;
  };
  slider: {
    title: string;
    subTitle: string;
    play: string;
    pause: string;
    reset: string;
    nowLive: string;
    plusMin: string;
    plusHour: string;
    rainRateLabel: string;
    forecastDepthLabel: string;
  };
  reportModal: {
    title: string;
    subTitle: string;
    locationLabel: string;
    depthLabel: string;
    photoLabel: string;
    photoNote: string;
    obsLabel: string;
    obsPlaceholder: string;
    helpCheck: string;
    submitBtn: string;
    submitting: string;
    cancelBtn: string;
    successToast: string;
  };
  authModal: {
    title: string;
    subTitle: string;
    domainLabel: string;
    domainPlaceholder: string;
    passcodeLabel: string;
    passcodePlaceholder: string;
    loginBtn: string;
    loggingIn: string;
    demoNote: string;
    invalidCredentials: string;
  };
  dashboard: {
    title: string;
    subTitle: string;
    officerBadge: string;
    totalSubmerged: string;
    surchargingPipes: string;
    pumpsActive: string;
    exportSitRep: string;
    pumpControllerTitle: string;
    pumpStatus: string;
    activatePump: string;
    deactivatePump: string;
    groundTruthTitle: string;
    verifyBtn: string;
    dismissBtn: string;
    statusPending: string;
    statusVerified: string;
    statusDismissed: string;
    evacRouteBtn: string;
  };
  sitrep: {
    title: string;
    subTitle: string;
    generatePdf: string;
    downloadCsv: string;
    downloadJson: string;
    generating: string;
    summaryHeading: string;
    criticalZones: string;
  };
  tide: {
    title: string;
    highTideCountdown: string;
    nextHighTide: string;
    seaLevel: string;
    reservoirStorage: string;
    lakesRunway: string;
  };
  drainage: {
    title: string;
    undergroundGraph: string;
    coupledSurface: string;
    pipeDischarge: string;
    capacityUsage: string;
    criticalNodes: string;
  };
  map: {
    layers: string;
    basemapVector: string;
    basemapSat: string;
    inundationMesh: string;
    pipeGraph: string;
    citizenReports: string;
    legendTitle: string;
    depthSafe: string;
    depthModerate: string;
    depthHigh: string;
    depthSevere: string;
    surchargingNode: string;
    safeRoute: string;
    popupRoad: string;
    popupDepth: string;
    popupStatus: string;
    popupPassable: string;
    popupImpassable: string;
  };
  evacuationModal: {
    title: string;
    subTitle: string;
    selectVehicle: string;
    hazardZone: string;
    shelterHeading: string;
    elevationGain: string;
    stepByStepHeading: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    step4Title: string;
    deployMapBtn: string;
    closeBtn: string;
  };
  citizenApp: {
    appTitle: string;
    appSubtitle: string;
    tabGis: string;
    tabAlerts: string;
    tabRoute: string;
    tabReport: string;
    useLiveGps: string;
    gpsAcquired: string;
    gpsDenied: string;
    locateMe: string;
    launchCitizenApp: string;
    tabEmergency: string;
  };
  emergencyServices: {
    title: string;
    subTitle: string;
    callNow: string;
    tollFree: string;
    ndrfTitle: string;
    ndrfDesc: string;
    national112Title: string;
    national112Desc: string;
    municipal1916Title: string;
    municipal1916Desc: string;
    ambulance108Title: string;
    ambulance108Desc: string;
    fire101Title: string;
    fire101Desc: string;
    police100Title: string;
    police100Desc: string;
    coastal1093Title: string;
    coastal1093Desc: string;
  };
  voiceNav: {
    voiceGuide: string;
    speaking: string;
    stopVoice: string;
    inMeters: string;
    turnLeft: string;
    turnRight: string;
    proceedStraight: string;
    hazardWarning: string;
    destinationArrived: string;
  };
  sidebar: {
    nowcastGis: string;
    hydroRouting: string;
    citizenSignals: string;
    adminModeration: string;
    waterBodies: string;
    simulationReplay: string;
    authorityMode: string;
  };
  simulation: {
    title: string;
    subTitle: string;
    benchmarkTitle: string;
    selectScenario: string;
    rainIntensity: string;
    solverTelemetry: string;
    runReplay: string;
    pauseReplay: string;
    resetReplay: string;
    historicalBenchmarks: string;
  };
  adminModeration: {
    portalBadge: string;
    title: string;
    subTitle: string;
    syncQueue: string;
    pendingOperator: string;
    awaitingTriage: string;
    crowdsourcedReports: string;
    validatedBottlenecks: string;
    activeHotspots: string;
    flowVelocities: string;
    clogsCleared: string;
    fullyRestored: string;
    desiltingCompleted: string;
    meshMultiplier: string;
    capacity: string;
    swmmCalibration: string;
    triageStream: string;
    pending: string;
    validated: string;
    resolved: string;
    allReports: string;
    noReports: string;
    reporter: string;
    coordinates: string;
    verifiedBy: string;
    verifyRestrict: string;
    dispatchCrew: string;
    clogCleared: string;
  };
  chatbot: {
    title: string;
    liveScada: string;
    quotaLabel: string;
    minimizeModal: string;
    expandModal: string;
    clearHistory: string;
    closeModal: string;
    rateLimitActive: string;
    suggestedQueries: string;
    inputPlaceholder: string;
    sendBtn: string;
    vehicleSafetyCat: string;
    vehicleSafetyQuery: string;
    radarCat: string;
    radarQuery: string;
    evacuationCat: string;
    evacuationQuery: string;
    scadaCat: string;
    scadaQuery: string;
  };
  citizenSignal: {
    groundTruthBadge: string;
    swmmModelFeedback: string;
    title: string;
    subTitle: string;
    cityCapacityFactor: string;
    activeHotspots: string;
    submitHazardHeader: string;
    locationSub: string;
    incidentLocation: string;
    autoGps: string;
    detecting: string;
    nearestManhole: string;
    selectCategory: string;
    waterlogging: string;
    blockedInlet: string;
    drainOverflow: string;
    sewerBackflow: string;
    severityLabel: string;
    penalty: string;
    reportTitle: string;
    titlePlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    attachPhoto: string;
    clearPhoto: string;
    sampleClogPhoto: string;
    sampleFloodPhoto: string;
    photoAttached: string;
    reporterHandle: string;
    reporterPlaceholder: string;
    submitBtn: string;
    liveStreamHeader: string;
    crowdObsSub: string;
    statusLabel: string;
    allReports: string;
    photoEvidence: string;
    verifiedByBmc: string;
  };
  hydroRouting: {
    engineBadge: string;
    scadaChainValidated: string;
    title: string;
    subTitle: string;
    triggerAutoDiversion: string;
    executingDiversion: string;
    syncBtn: string;
    divertedVolume: string;
    activeBypassFlow: string;
    activeSluiceGates: string;
    gatesOpen: string;
    scadaStatus: string;
    allResponding: string;
    bufferHeadroom: string;
    storageRemaining: string;
    systemAuditLog: string;
    tamperProof: string;
    sluiceRegistryTitle: string;
    infrastructureSub: string;
    filterSink: string;
    allSinks: string;
    stpSinks: string;
    marSinks: string;
    lakeSinks: string;
    storageFill: string;
    intakeFlow: string;
    sluiceGate: string;
    adjustActuator: string;
    scadaAuditLedger: string;
    genesisToHead: string;
    blocksVerified: string;
    blockIndex: string;
    prevHash: string;
    overrideModalTitle: string;
    targetInfrastructure: string;
    gatePosition: string;
    openLabel: string;
    closedLabel: string;
    operationalJustification: string;
    auditLogNotice: string;
    cancelBtn: string;
    signDispatchBtn: string;
  };
  nowcast: {
    title: string;
    deepseekBadge: string;
    fallbackBadge: string;
    predicting: string;
    refreshBtn: string;
    runPredictionBtn: string;
    emptyStatePrompt: string;
    reasoningSensorData: string;
    riskSuffix: string;
    confidenceSuffix: string;
    outlookHeading: string;
    nowLabel: string;
    keyRisksHeading: string;
    recommendationHeading: string;
    aiReasoningHeading: string;
    sensorInputsHeading: string;
  };
  precipitationBadge: {
    liveRadar: string;
    modelEstimate: string;
    noData: string;
    lastUpdated: string;
    decodeConfidence: string;
    stationCode: string;
    freshness: string;
    freshLabel: string;
    staleLabel: string;
    source: string;
  };
  waterAtlas: {
    atlasBadge: string;
    coastalSyncBadge: string;
    title: string;
    subTitle: string;
    highTidePeak: string;
    flapGateLockout: string;
    preventsBackflow: string;
    urbanReservoirsHeading: string;
    totalBufferHeadroom: string;
    FTL: string;
    storage: string;
    cushion: string;
    encroachment: string;
    priority: string;
    coastalOutfallsHeading: string;
    tidalFlapSub: string;
    dischargeRate: string;
    seaInvertHead: string;
  };
  splash: {
    loadingLabel: string;
    title: string;
    subtitle: string;
  };
  simulationTutorial: {
    bannerTitle: string;
    bannerText: string;
    selectorTitle: string;
    selectorText: string;
    controlsTitle: string;
    controlsText: string;
    provenanceTitle: string;
    provenanceText: string;
    mapTitle: string;
    mapText: string;
    nextBtn: string;
    finishBtn: string;
    skipBtn: string;
    stepOf: string;
  };
  common: {
    panelTab: string;
    gisMapTab: string;
    loadingGis: string;
    loadingCitizenApp: string;
    loadingOperationsHub: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationSchema> = {
  en: {
    nav: {
      brand: 'SURGE',
      subTitle: 'Public Citizen Urban Flood Nowcasting Portal',
      backToLanding: 'Back to Landing Page',
      openMeteoApi: 'Open-Meteo API',
      liveWeather: 'Open-Meteo Live Weather',
      maxDepth: 'Max Depth',
      reportWater: 'Report Water',
      authorityCenter: 'Authority Command Center',
      authorityPortal: 'Authority Portal',
      selectCity: 'Select City',
      selectEvent: 'Select Rain Scenario',
      lakes7: '7 Lakes: 87%',
      reservoirs5: '5 Reservoirs: 82%',
      yamunaStage: 'Yamuna Stage: 204.8m',
    },
    landing: {
      fullForm: 'Vulnerability-mapped Rainfall & Inundation System for Hyperlocal Tracking & Intervention',
      citizenDashboardBtn: 'Citizen Dashboard',
      leadTimeBadge: '0–3 Hour Forward-Looking Lead Time',
      heroTitle: 'Coupled Surface & Subterranean Urban Flood Intelligence',
      heroSubtitle: 'Predict street-level water depths, manhole surcharge backflows, and generate flood-safe emergency transit routes in real-time.',
      metricLeadTime: '0–3 h',
      metricHydraulics: '1D + 2D',
      metricPrecision: 'Street-Level',
      metricDetours: '100%',
      metricLeadTimeSub: 'Forecast Lead Time',
      metricHydraulicsSub: 'Coupled Hydraulics',
      metricPrecisionSub: 'Depth Precision (cm)',
      metricDetoursSub: 'Dynamic Safe Detours',
      selectCityTitle: 'Select Metro City Command Center',
      selectCitySub: 'Choose a city below to open its live interactive GIS flood dashboard',
      liveRadar: 'Live Radar',
      highRiskHotspots: 'High-Risk Micro-Hotspots:',
      authorityLoginDomain: 'Authority Login:',
      launchDashboard: 'Launch Dashboard',
      authorityLoginBtn: 'Authority Login',
      simTitle: 'Interactive Hydraulic Runoff Simulator Preview',
      simSub: 'Adjust rainfall intensity to test predicted street inundation and drainage response',
      simRainRate: 'Simulated Rain Rate:',
      moderate: 'Moderate (15 mm/h)',
      heavy: 'Heavy (45 mm/h)',
      cloudburst: 'Cloudburst (85 mm/h)',
      predictedDepth: 'Predicted Street Water Depth:',
      underpassLocation: 'at low elevation underpass',
      capacityExceeded: 'Drainage pipe capacity exceeded (>100%). Manhole backflow surcharging onto surface.',
      capacityAdequate: 'Drainage network capacity adequate. Water flowing via gravity.',
      faqTitle: 'Frequently Asked Questions',
      faqBadge: 'Frequently Asked Questions',
      faqMainHeading: 'Everything You Need to Know About SURGE',
      footerTitle: 'SURGE • Urban Flood Hydro-Dynamic Prediction System',
      footerSub: 'Ministry of Earth Sciences (MoES) • National Centre for Medium Range Weather Forecasting (NCMRWF)',
      feature1Title: 'Coupled 1D + 2D Hydraulics',
      feature1Sub: 'Integrates Doppler radar rain nowcasts with 2D DEM surface runoff & 1D subterranean pipe graphs.',
      feature2Title: 'Flood-Safe Navigation API',
      feature2Sub: 'Reroutes ambulances, sedans, & rescue vehicles around submerged underpasses in real-time.',
      feature3Title: 'Municipal SitRep Exporter',
      feature3Sub: 'Empowers disaster management teams with SCADA pump controls & official PDF briefings.',
    },
    faqs: [
      {
        q: 'What credentials do municipal authorities use to log in?',
        a: 'Official municipal control room officers log in using their city authority domain: cityname.aqua.gov.in (e.g., mumbai.aqua.gov.in, delhi.aqua.gov.in, chennai.aqua.gov.in) with passcode: 12345678. Authority access unlocks 1D subterranean drainage telemetry, outfall dewatering pump controls, and executive SitRep PDF generators.'
      },
      {
        q: 'How does SURGE predict street flooding 0–3 hours in advance?',
        a: 'Traditional weather models only forecast volume of rain. SURGE couples live Doppler Radar rainfall nowcasts with a 2D Digital Elevation Model (DEM) and a 1D directed graph representation of subterranean stormwater drains to pinpoint street inundation depths in centimeters.'
      },
      {
        q: 'Which Indian metropolitan cities are currently active?',
        a: 'SURGE currently features high-resolution spatial models for Mumbai (Hindmata, Dadar, Kurla, Andheri), Delhi NCR (Minto Bridge, ITO Junction, Pul Prahladpur), and Chennai (Velachery, T. Nagar, Saidapet).'
      },
      {
        q: 'How does the Flood-Safe Emergency Navigation API work?',
        a: 'Standard navigation apps use static road speed limits. SURGE dynamically increases travel-time weights when predicted water depth exceeds vehicle clearance thresholds (e.g., >15cm for sedans, >25cm for ambulances), routing vehicles safely around flooded underpasses.'
      },
      {
        q: 'How can citizens contribute ground-truth report corrections?',
        a: 'Citizens and ground volunteers can tap "Report Water" to submit local water depth observations, location tags, and ground photos.'
      }
    ],
    routing: {
      title: 'Flood-Safe Emergency Route Planner',
      subTitle: 'Calculates dynamic flood-avoidance transit pathways updated against live hydrodynamic forecast',
      originPlaceholder: 'Starting Location / Current GPS',
      destPlaceholder: 'Destination Address / Hospital / Shelter',
      pickOrigin: 'Pin Origin',
      pickDest: 'Pin Destination',
      pinned: 'Pinned on map',
      carSedan: 'Car / Sedan',
      ambulance: 'Ambulance (Emergency)',
      autoBike: 'Auto / Bike',
      pedestrian: 'Pedestrian (Walking)',
      findRoute: 'Calculate Safe Route',
      calculating: 'Calculating Dynamic Route...',
      distance: 'Distance',
      eta: 'Est. Transit Time',
      riskScore: 'Route Risk',
      riskSafe: 'Safe Route (0-10cm)',
      riskModerate: 'Moderate Inundation (10-25cm)',
      riskHigh: 'High Risk (25-45cm)',
      riskImpassable: 'Impassable (>45cm)',
      turnByTurn: 'Turn-by-Turn Safe Navigation',
      noRouteFound: 'No safe route found matching clearance limits. Please select alternative points.',
      pickLocationPrompt: 'Click on the map to set location',
      clearRoute: 'Clear Route',
      vehicleProfileClearance: 'Vehicle Profile & Clearance:',
      maxSafe: 'Max Safe:',
      hatchback: 'Hatchback',
      suv: 'SUV 4x4',
      bus: 'Bus / Heavy Vehicle',
      realRoadSafeRoute: 'SURGE Real Road Flood-Safe Route',
      noSafeRouteFor: 'NO SAFE ROUTE FOR',
      selectHazardZone: 'Select Flood Hazard Zone:',
      nearestShelter: 'Nearest Safe Assembly Shelter',
      rescueVehicleRoute: 'Rescue Vehicle Route',
    },
    alerts: {
      title: 'Live Hazard Alerts',
      subTitle: 'Real-time inundation & drainage surcharge notifications',
      tabAll: 'All Alerts',
      tabInundation: 'Street Flooding',
      tabSurcharge: 'Pipe Surcharge',
      tabReports: 'Citizen Reports',
      critical: 'CRITICAL',
      warning: 'WARNING',
      advisory: 'ADVISORY',
      helplineTitle: 'Emergency Disaster Helplines',
      ndrfHelpline: 'NDRF Control Room',
      controlRoom: 'Municipal Control Room',
      disasterLine: 'Disaster Emergency Line',
      reportedAgo: 'mins ago',
      verified: 'Verified by Control Room',
      unverified: 'Citizen Unverified',
      borough: 'Borough',
      elevation: 'Elevation',
      overcapacity: 'OVERCAPACITY',
      surfaceSpill: 'SURFACE SPILL',
      hydraulicBackflow: 'Hydraulic Backflow',
      noAlerts: 'No critical flood bottlenecks predicted for this time lead.',
    },
    slider: {
      title: '0–3 Hour Flood Inundation Forecast Scrubber',
      subTitle: 'Scrub timeline to preview hydro-dynamic street flooding evolution',
      play: 'Play Simulation',
      pause: 'Pause Simulation',
      reset: 'Reset to Now',
      nowLive: 'NOW (Live)',
      plusMin: 'min',
      plusHour: 'hr',
      rainRateLabel: 'Rain Intensity:',
      forecastDepthLabel: 'Max Inundation:',
    },
    reportModal: {
      title: 'Report Water Depth & Flooding',
      subTitle: 'Help municipal control rooms verify real-time street inundation',
      locationLabel: 'Location / Landmark',
      depthLabel: 'Observed Water Depth (cm)',
      photoLabel: 'Upload Photo Observation (Optional)',
      photoNote: 'Click or drag photo of flooded street',
      obsLabel: 'Additional Details',
      obsPlaceholder: 'Mention stranded vehicles, blocked drains, or emergency shelter requests...',
      helpCheck: 'Emergency Assistance Needed Immediately',
      submitBtn: 'Submit Ground Report',
      submitting: 'Submitting Report...',
      cancelBtn: 'Cancel',
      successToast: 'Report submitted successfully to municipal control center!',
    },
    authModal: {
      title: 'Disaster Management Officer Login',
      subTitle: 'Access subterranean 1D telemetry, dewatering pumps, and SitRep exporter',
      domainLabel: 'Authority Login Domain / ID',
      domainPlaceholder: 'e.g. mumbai.aqua.gov.in',
      passcodeLabel: 'Official Access Passcode',
      passcodePlaceholder: 'Enter 8-digit passcode',
      loginBtn: 'Sign In to Command Center',
      loggingIn: 'Authenticating Credentials...',
      demoNote: 'Demo Official Passcode for all cities:',
      invalidCredentials: 'Invalid authority login domain or passcode. Use demo passcode 12345678.',
    },
    dashboard: {
      title: 'Disaster Management Command Center',
      subTitle: 'Real-time municipal flood telemetry, pump control & emergency evacuation',
      officerBadge: 'Active Officer:',
      totalSubmerged: 'Submerged Road Segments',
      surchargingPipes: 'Surcharging Drain Pipe Nodes',
      pumpsActive: 'Dewatering Pumps Active',
      exportSitRep: 'Export SitRep PDF / CSV',
      pumpControllerTitle: 'Dewatering Pump Station Operations',
      pumpStatus: 'Pump Status',
      activatePump: 'Activate Pump (1500 L/s)',
      deactivatePump: 'Standby Mode',
      groundTruthTitle: 'Ground-Truth Citizen Reports Verification',
      verifyBtn: 'Verify & Dispatch',
      dismissBtn: 'Dismiss Report',
      statusPending: 'Pending Review',
      statusVerified: 'Verified & Actioned',
      statusDismissed: 'Dismissed',
      evacRouteBtn: 'Generate Evacuation Plan',
    },
    sitrep: {
      title: 'Situation Report (SitRep) Exporter',
      subTitle: 'Generate official hydro-dynamic flood status reports for executive briefings',
      generatePdf: 'Download SitRep PDF',
      downloadCsv: 'Export Telemetry CSV',
      downloadJson: 'Export Telemetry JSON',
      generating: 'Generating Executive Briefing...',
      summaryHeading: 'Executive Hydro-Dynamic Situation Summary',
      criticalZones: 'Primary High-Risk Zones:',
    },
    tide: {
      title: 'Tide & Waterbody Telemetry',
      highTideCountdown: 'Next High Tide In:',
      nextHighTide: 'Peak Surge Height:',
      seaLevel: 'Coastal Sea Level:',
      reservoirStorage: 'Key Reservoir Storage:',
      lakesRunway: 'Water Supply Runway:',
    },
    drainage: {
      title: 'Coupled Subterranean Drainage Graph',
      undergroundGraph: '1D Underground Storm Drain Network',
      coupledSurface: 'Coupled Surface DEM Runoff',
      pipeDischarge: 'Max Pipe Discharge Rate',
      capacityUsage: 'Network Capacity Utilization',
      criticalNodes: 'Surcharging Manhole Nodes',
    },
    map: {
      layers: 'Map Layers',
      basemapVector: 'Street Basemap',
      basemapSat: 'Satellite Basemap',
      inundationMesh: 'Flood Inundation Depth',
      pipeGraph: 'Drainage Pipe Network',
      citizenReports: 'Citizen Reports',
      legendTitle: 'Water Depth Legend',
      depthSafe: '< 10 cm (Passable)',
      depthModerate: '10 – 25 cm (Caution)',
      depthHigh: '25 – 45 cm (High Risk)',
      depthSevere: '> 45 cm (Impassable)',
      surchargingNode: 'Surcharging Manhole Backflow',
      safeRoute: 'Flood-Safe Detour Route',
      popupRoad: 'Road Segment:',
      popupDepth: 'Predicted Depth:',
      popupStatus: 'Status:',
      popupPassable: 'Passable for Vehicles',
      popupImpassable: 'Flooded - Avoid Route',
    },
    evacuationModal: {
      title: 'Emergency Evacuation & Guidance Plan',
      subTitle: 'Step-by-step transit route tailored to your vehicle & flood clearance limits',
      selectVehicle: 'Select Your Vehicle Profile:',
      hazardZone: 'Active Flood Hazard Zone',
      shelterHeading: 'Nearest Safe Assembly Shelter',
      elevationGain: 'Elevation Gain',
      stepByStepHeading: 'Step-by-Step Evacuation Transit Plan',
      step1Title: 'Step 1: Rapid Prep & Clearance Check',
      step2Title: 'Step 2: Restricted Submerged Corridor Avoidance',
      step3Title: 'Step 3: Turn-by-Turn Safe Transit Path',
      step4Title: 'Step 4: Arrival & Relief Center Check-In',
      deployMapBtn: 'Deploy Evacuation Route on GIS Map',
      closeBtn: 'Close Evacuation Plan',
    },
    citizenApp: {
      appTitle: 'SURGE Citizen Portal',
      appSubtitle: 'Public Street Flood Hazards, Live GPS Route Avoidance & Water Logging Reporting',
      tabGis: 'Live Inundation',
      tabAlerts: 'Live Alerts',
      tabRoute: 'Flood Safe Navigation',
      tabReport: 'Report Water logging',
      useLiveGps: 'Use My Live GPS Location',
      gpsAcquired: 'Live GPS Location Acquired',
      gpsDenied: 'GPS Permission Denied or Unavailable',
      locateMe: 'Locate Me',
      launchCitizenApp: 'Open Citizen Mobile App',
      tabEmergency: 'Emergency Contacts',
    },
    emergencyServices: {
      title: 'Indian Emergency Helplines',
      subTitle: '1-Tap Toll-Free Direct Lines for Disaster Response & Medical Triage',
      callNow: 'Call',
      tollFree: '24x7 Toll-Free',
      ndrfTitle: 'NDRF Disaster Response Control Room',
      ndrfDesc: 'National Disaster Response Force (NDRF) flood rescue, boat evacuation, and heavy cloudburst operations.',
      national112Title: 'All-India Unified Emergency Line',
      national112Desc: 'Single emergency response helpline number across all Indian states and Union Territories.',
      municipal1916Title: 'City Disaster Management Control Room',
      municipal1916Desc: 'Municipal corporation (BMC/NDMC/GCC) urban flood helpline, tree fall clearance, and dewatering pumps.',
      ambulance108Title: 'Emergency Medical & Ambulance Service',
      ambulance108Desc: 'Free emergency medical ambulance, trauma response, and flood triage transport.',
      fire101Title: 'Fire Brigade & Flood Water Rescue',
      fire101Desc: 'Submerged underpass vehicle extraction, trapped civilian rescue, and high-water pumping.',
      police100Title: 'Police Control Room & Traffic Police',
      police100Desc: 'Emergency law enforcement, flooded highway traffic diversion, and evacuation cordons.',
      coastal1093Title: 'Coastal Security & High-Tide Patrol',
      coastal1093Desc: 'Indian Coast Guard & Maritime Board emergency helpline for storm surge and coastal water logging.',
    },
    voiceNav: {
      voiceGuide: 'Voice Navigation',
      speaking: 'Playing Audio...',
      stopVoice: 'Stop Voice',
      inMeters: 'In {distance} meters',
      turnLeft: 'turn left onto',
      turnRight: 'turn right onto',
      proceedStraight: 'proceed straight along',
      hazardWarning: 'Warning! Submerged underpass ahead. Detour recommended.',
      destinationArrived: 'You have arrived at your safe high-elevation destination shelter.',
    },
    sidebar: {
      nowcastGis: 'GIS Flood Map',
      hydroRouting: 'Hydro Routing',
      citizenSignals: 'Citizen Signals',
      adminModeration: 'Moderation Queue',
      waterBodies: 'Water Atlas',
      simulationReplay: 'Simulation Replay',
      authorityMode: 'AUTHORITY MODE',
    },
    simulation: {
      title: 'Real-Time Hydraulic Runoff Simulation Replay',
      subTitle: 'Benchmark archived monsoon deluges and test live drainage network discharge capacity',
      benchmarkTitle: 'Historical Benchmark Replays',
      selectScenario: 'Select Storm Scenario',
      rainIntensity: 'Rainfall Intensity',
      solverTelemetry: 'Hydraulic Solver Telemetry',
      runReplay: 'Run Simulation',
      pauseReplay: 'Pause Replay',
      resetReplay: 'Reset Timeline',
      historicalBenchmarks: 'Archived Benchmark Deluges',
    },
    adminModeration: {
      portalBadge: 'Municipal Command & Moderation Portal',
      title: 'Stormwater Drain Moderation & Crew Dispatch Desk',
      subTitle: 'Verify citizen-reported clogs and sewer backflows. Approving a report automatically applies a dynamic head-loss penalty to the corresponding node in the 0–3h flood nowcasting engine.',
      syncQueue: 'Sync Queue',
      pendingOperator: 'Pending Operator Review',
      awaitingTriage: 'Awaiting triage',
      crowdsourcedReports: 'Citizen crowdsourced reports',
      validatedBottlenecks: 'Validated Bottlenecks',
      activeHotspots: 'Active Hotspots',
      flowVelocities: 'Affecting hydraulic flow velocities',
      clogsCleared: 'Clogs Cleared & Resolved',
      fullyRestored: 'Fully Restored',
      desiltingCompleted: 'Desilting crews completed work',
      meshMultiplier: 'Hydraulic Mesh Multiplier',
      capacity: 'Capacity',
      swmmCalibration: 'Real-time SWMM calibration factor',
      triageStream: 'Triage & Dispatch Stream',
      pending: 'Pending',
      validated: 'Validated',
      resolved: 'Resolved',
      allReports: 'All Reports',
      noReports: 'No reports in this category. System operations operating nominally.',
      reporter: 'Reporter',
      coordinates: 'Coordinates',
      verifiedBy: 'Verified by',
      verifyRestrict: 'Verify & Restrict',
      dispatchCrew: 'Dispatch Crew & Resolve',
      clogCleared: 'Clog Cleared',
    },
    chatbot: {
      title: 'SURGE AI Operations Desk',
      liveScada: 'Live SCADA & Telemetry Fused',
      quotaLabel: 'Quota',
      minimizeModal: 'Minimize modal',
      expandModal: 'Expand modal',
      clearHistory: 'Clear chat history',
      closeModal: 'Close chat modal',
      rateLimitActive: 'Rolling rate limit hit. Quota resets in',
      suggestedQueries: 'Suggested Operations Queries:',
      inputPlaceholder: 'Ask SURGE AI about road safety, nowcasts, radar...',
      sendBtn: 'Send',
      vehicleSafetyCat: 'Vehicle Safety',
      vehicleSafetyQuery: 'Will a Hatchback or Sedan pass safely through 35cm flooded roads?',
      radarCat: 'Radar & Nowcast',
      radarQuery: 'How does SURGE couple Doppler Radar with 1D drain graphs?',
      evacuationCat: 'Evacuation',
      evacuationQuery: 'How do I locate the nearest high-elevation flood relief shelter?',
      scadaCat: 'SCADA Telemetry',
      scadaQuery: 'What do the live surcharging node alerts and tide levels mean?',
    },
    citizenSignal: {
      groundTruthBadge: 'Citizen Ground-Truth Layer',
      swmmModelFeedback: 'Direct SWMM Model Feedback',
      title: 'Drain Blockage & Waterlogging Signal Desk',
      subTitle: 'Report choked grates, overflowing stormwater nallas, and standing water in real time. Verified community signals directly calibrate the hydrodynamic drainage network capacity.',
      cityCapacityFactor: 'City Hydraulic Capacity Factor',
      activeHotspots: 'Verified Hotspots Active',
      submitHazardHeader: 'Submit Hazard Observation',
      locationSub: 'Coordinates are automatically linked to the nearest municipal SWD manhole.',
      incidentLocation: 'Incident Location:',
      autoGps: 'Auto GPS',
      detecting: 'Detecting...',
      nearestManhole: 'Nearest Drainage Manhole:',
      selectCategory: 'Select Hazard Category:',
      waterlogging: 'Street Waterlogging',
      blockedInlet: 'Blocked Catch Basin',
      drainOverflow: 'Storm Drain Overflow',
      sewerBackflow: 'Hydraulic Backflow',
      severityLabel: 'Estimated Blockage Severity:',
      penalty: 'Penalty',
      reportTitle: 'Report Title:',
      titlePlaceholder: 'e.g. Silt and trash choking catch-basin grate',
      notesLabel: 'Observation Notes:',
      notesPlaceholder: 'Describe water depth, traffic blockage, or backflow...',
      attachPhoto: 'Attach Evidence Photo:',
      clearPhoto: 'Clear',
      sampleClogPhoto: 'Sample Clog Photo',
      sampleFloodPhoto: 'Sample Flood Photo',
      photoAttached: 'Photo Attached',
      reporterHandle: 'Reporter Handle / Ward:',
      reporterPlaceholder: 'e.g. KurlaResident_WardL',
      submitBtn: 'Submit Ground-Truth Observation',
      liveStreamHeader: 'Live Community Blockage Stream',
      crowdObsSub: 'Real-time crowd observations verified by municipal hydrologists.',
      statusLabel: 'Status:',
      allReports: 'All Reports',
      photoEvidence: 'Photographic Evidence',
      verifiedByBmc: 'Validated by BMC',
    },
    hydroRouting: {
      engineBadge: 'Dynamic Hydro-Routing Engine',
      scadaChainValidated: 'SHA-256 SCADA Chain Validated',
      title: 'Storm Runoff Diversion & Buffer Matrix',
      subTitle: 'Automated diversion of surcharging surface runoff away from flooded junctions directly into Sewage Treatment Plants (STPs), deep Managed Aquifer Recharge (MAR) boreholes, and urban retention basins.',
      triggerAutoDiversion: 'Trigger Auto-Diversion Matrix',
      executingDiversion: 'Executing Diversion...',
      syncBtn: 'Sync',
      divertedVolume: 'Diverted Runoff Volume',
      activeBypassFlow: 'Active bypass flow:',
      activeSluiceGates: 'Active Sluice Gates',
      gatesOpen: 'Gates Open',
      scadaStatus: 'SCADA Status:',
      allResponding: 'All Responding',
      bufferHeadroom: 'Available Buffer Headroom',
      storageRemaining: 'Remaining buffer storage across sinks',
      systemAuditLog: 'System Audit Log',
      tamperProof: 'TAMPER-PROOF',
      sluiceRegistryTitle: 'Municipal Sinks & Water Sluice Actuator Registry',
      infrastructureSub: 'Verified physical infrastructure assets capable of receiving excess floodwater volumes.',
      filterSink: 'Filter Sink:',
      allSinks: 'All Registered Sinks',
      stpSinks: 'STPs / WWTPs',
      marSinks: 'MAR Injection Boreholes',
      lakeSinks: 'Urban Retention Lakes',
      storageFill: 'Current Storage Fill',
      intakeFlow: 'Intake Flow',
      sluiceGate: 'Sluice Gate',
      adjustActuator: 'Adjust Sluice Actuator',
      scadaAuditLedger: 'SCADA Operations Audit Ledger',
      genesisToHead: 'Genesis-to-head SHA-256 cryptographic chain verifying every sluice gate actuation.',
      blocksVerified: 'Blocks Verified',
      blockIndex: 'Block #',
      prevHash: 'Prev Hash:',
      overrideModalTitle: 'SCADA Sluice Gate Override',
      targetInfrastructure: 'Target Sink Infrastructure:',
      gatePosition: 'Gate Actuator Position:',
      openLabel: 'OPEN',
      closedLabel: 'Closed',
      operationalJustification: 'Operational Justification (Logged On-Chain):',
      auditLogNotice: 'This manual state transition will be hashed with SHA-256 and appended to the immutable municipal SCADA block ledger.',
      cancelBtn: 'Cancel',
      signDispatchBtn: 'Sign & Dispatch',
    },
    nowcast: {
      title: 'AI Flood Nowcast',
      deepseekBadge: 'Qwen 2.5 3B',
      fallbackBadge: 'Fallback',
      predicting: 'Predicting...',
      refreshBtn: 'Refresh',
      runPredictionBtn: 'Run Prediction',
      emptyStatePrompt: 'Click Run Prediction to generate a Qwen 2.5 3B flood nowcast using live Doppler radar, wind, and precipitation data.',
      reasoningSensorData: 'Qwen 2.5:3b reasoning on sensor data...',
      riskSuffix: 'RISK',
      confidenceSuffix: 'confidence',
      outlookHeading: 'Outlook',
      nowLabel: 'Now',
      keyRisksHeading: 'Key Risks',
      recommendationHeading: 'Recommendation',
      aiReasoningHeading: 'AI Reasoning',
      sensorInputsHeading: 'Sensor inputs',
    },
    precipitationBadge: {
      liveRadar: 'Live Radar',
      modelEstimate: 'Model Estimate (Fallback)',
      noData: 'No Live Precipitation Data',
      lastUpdated: 'Last Updated',
      decodeConfidence: 'Decode Confidence',
      stationCode: 'Station Code',
      freshness: 'Freshness',
      freshLabel: 'Fresh (within 10m)',
      staleLabel: 'Stale',
      source: 'Source',
    },
    waterAtlas: {
      atlasBadge: 'Catchments & Water Bodies Atlas',
      coastalSyncBadge: 'Coastal Outfall Flap Gate Sync',
      title: 'Urban Lake Retention & Coastal Tidal Gating',
      subTitle: 'Real-time Full Tank Level (FTL) headroom across urban retention water bodies, encroachment indices, and automated coastal storm flap gates synchronized to ocean tidal cycles.',
      highTidePeak: 'High Tide Peak (Mumbai Port)',
      flapGateLockout: 'Flap Gate Lockout:',
      preventsBackflow: 'Prevents marine surge backflow',
      urbanReservoirsHeading: 'Urban Retention Reservoirs & Lake Capacities',
      totalBufferHeadroom: 'Total Flood Buffer Headroom:',
      FTL: 'Full Tank Level (FTL)',
      storage: 'Storage',
      cushion: 'Cushion',
      encroachment: 'Encroachment:',
      priority: 'Priority:',
      coastalOutfallsHeading: 'Coastal Stormwater Outfalls & Marine Backflow Lockout',
      tidalFlapSub: 'Tidal flap gates automatically close during high tide to prevent seawater backflow into low-lying urban areas.',
      dischargeRate: 'Discharge Rate',
      seaInvertHead: 'Sea Invert Head',
    },
    splash: {
      loadingLabel: 'SURGE Hydrological Platform Loading',
      title: 'SURGE',
      subtitle: 'Urban Flood Intelligence Platform',
    },
    simulationTutorial: {
      bannerTitle: 'Simulation Mode Safety Banner',
      bannerText: 'Always check the top safety banner — this environment replays historical flood events from IMD archives and does not reflect live disaster telemetry.',
      selectorTitle: 'City Focus & Event Selector',
      selectorText: 'Switch focus cities (Mumbai, Delhi, Chennai) and select from 9 authentic IMD/CAG-documented historical cloudburst events.',
      controlsTitle: 'Interactive Timeline Replay Controls',
      controlsText: 'Replay the 9-step flood progression using Play/Pause, timeline scrubbing slider, and 1x/4x/16x playback speed selectors.',
      provenanceTitle: 'Data Provenance & AI Intelligence',
      provenanceText: 'Verify step-by-step data provenance indicating exact IMD gauge recordings versus interpolated steps, alongside DeepSeek R1 AI decision synthesis.',
      mapTitle: 'Hydraulic GIS Vector Map Canvas',
      mapText: 'Inspect simulated water depth contours on the OpenLayers map canvas alongside markers indicating documented local impact hotspots.',
      nextBtn: 'Next',
      finishBtn: 'Finish',
      skipBtn: 'Skip',
      stepOf: 'Step',
    },
    common: {
      panelTab: 'Panel',
      gisMapTab: 'GIS Map',
      loadingGis: 'Loading OpenLayers Vector GIS Engine...',
      loadingCitizenApp: 'Loading SURGE Citizen App...',
      loadingOperationsHub: 'Loading SURGE Operations Hub...',
    },
  },

  hi: {
    nav: {
      brand: 'SURGE',
      subTitle: 'नागरिक शहरी बाढ़ पूर्वाभास पोर्टल',
      backToLanding: 'मुख्य पृष्ठ पर लौटें',
      openMeteoApi: 'ओपन-मीटियो एपीआई',
      liveWeather: 'ओपन-मीटियो लाइव मौसम',
      maxDepth: 'अधिकतम गहराई',
      reportWater: 'जलभराव की रिपोर्ट करें',
      authorityCenter: 'प्राधिकरण कमांड सेंटर',
      authorityPortal: 'प्राधिकरण पोर्टल',
      selectCity: 'शहर चुनें',
      selectEvent: 'वर्षा परिदृश्य चुनें',
      lakes7: '7 झीलें: 87%',
      reservoirs5: '5 जलाशय: 82%',
      yamunaStage: 'यमुना का स्तर: 204.8m',
    },
    landing: {
      fullForm: 'अति-स्थानीय ट्रैकिंग और हस्तक्षेप के लिए भेद्यता-मानचित्रित वर्षा और जलभराव प्रणाली',
      citizenDashboardBtn: 'नागरिक डैशबोर्ड',
      leadTimeBadge: '0–3 घंटे का अग्रिम पूर्वानुमान समय',
      heroTitle: 'सतही एवं भूमिगत एकीकृत शहरी बाढ़ खुफिया प्रणाली',
      heroSubtitle: 'सड़क स्तर पर पानी की गहराई, मैनहोल बैकफ़्लो और बाढ़-सुरक्षित आपातकालीन मार्गों का वास्तविक समय में पूर्वानुमान लगाएं।',
      metricLeadTime: '0–3 घंटे',
      metricHydraulics: '1D + 2D',
      metricPrecision: 'सड़क-स्तर',
      metricDetours: '100%',
      metricLeadTimeSub: 'पूर्वाभास समय',
      metricHydraulicsSub: 'एकीकृत हाइड्रोलिक्स',
      metricPrecisionSub: 'गहराई सटीकता (सेमी)',
      metricDetoursSub: 'डायनामिक सुरक्षित मार्ग',
      selectCityTitle: 'मेट्रो सिटी कमांड सेंटर चुनें',
      selectCitySub: 'लाइव इंटरैक्टिव जीआईएस बाढ़ डैशबोर्ड खोलने के लिए नीचे एक शहर चुनें',
      liveRadar: 'लाइव रडार',
      highRiskHotspots: 'उच्च जोखिम वाले क्षेत्र:',
      authorityLoginDomain: 'प्राधिकरण लॉगिन:',
      launchDashboard: 'डैशबोर्ड खोलें',
      authorityLoginBtn: 'प्राधिकरण लॉगिन',
      simTitle: 'इंटरैक्टिव हाइड्रोलिक रनऑफ सिम्युलेटर पूर्वावलोकन',
      simSub: 'सड़क जलभराव और ड्रेनेज प्रतिक्रिया का परीक्षण करने के लिए वर्षा की तीव्रता समायोजित करें',
      simRainRate: 'सिम्युलेटेड वर्षा दर:',
      moderate: 'मध्यम (15 मिमी/घंटा)',
      heavy: 'भारी (45 मिमी/घंटा)',
      cloudburst: 'बादल फटना (85 मिमी/घंटा)',
      predictedDepth: 'अनुमानित सड़क जल गहराई:',
      underpassLocation: 'निचले अंडरपास पर',
      capacityExceeded: 'ड्रेनेज पाइप क्षमता से अधिक (>100%)। सतह पर ओवरफ़्लो।',
      capacityAdequate: 'ड्रेनेज नेटवर्क क्षमता पर्याप्त है। पानी गुरुत्वाकर्षण द्वारा बह रहा है।',
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
      faqBadge: 'अक्सर पूछे जाने वाले प्रश्न',
      faqMainHeading: 'SURGE के बारे में वह सब कुछ जो आपको जानना आवश्यक है',
      footerTitle: 'SURGE • शहरी बाढ़ हाइड्रो-डायनामिक पूर्वानुमान प्रणाली',
      footerSub: 'पृथ्वी विज्ञान मंत्रालय (MoES) • राष्ट्रीय मध्यम अवधि मौसम पूर्वानुमान केंद्र (NCMRWF)',
      feature1Title: 'एकीकृत 1D + 2D हाइड्रोलिक्स',
      feature1Sub: 'डॉपलर रडार वर्षा पूर्वानुमान को 2D सतही पानी और 1D भूमिगत नाले के नेटवर्क के साथ जोड़ता है।',
      feature2Title: 'बाढ़-सुरक्षित नेविगेशन एपीआई',
      feature2Sub: 'जलमग्न रास्तों और अंडरपास से बचाकर एम्बुलेंस और वाहनों को सुरक्षित री-रूट करता है।',
      feature3Title: 'आपदा रिपोर्ट (SitRep) निर्यातक',
      feature3Sub: 'आपदा प्रबंधन टीमों को पंप नियंत्रण और आधिकारिक रिपोर्ट डाउनलोड की सुविधा देता है।',
    },
    faqs: [
      {
        q: 'नगर निगम अधिकारी लॉगिन करने के लिए किन क्रेडेंशियल्स का उपयोग करते हैं?',
        a: 'आधिकारिक नगर निगम नियंत्रण कक्ष अधिकारी अपने शहर प्राधिकरण डोमेन का उपयोग करके लॉगिन करते हैं: cityname.aqua.gov.in (जैसे, mumbai.aqua.gov.in, delhi.aqua.gov.in, chennai.aqua.gov.in) पासकोड: 12345678 के साथ।'
      },
      {
        q: 'SURGE 0–3 घंटे पहले सड़क जलभराव का पूर्वानुमान कैसे लगाता है?',
        a: 'पारंपरिक मौसम मॉडल केवल वर्षा की मात्रा का अनुमान लगाते हैं। SURGE लाइव डॉपलर रडार वर्षा को 2D डिजिटल एलिवेशन मॉडल (DEM) और 1D भूमिगत नाले के नेटवर्क के साथ जोड़ता है।'
      },
      {
        q: 'वर्तमान में कौन से भारतीय महानगर सक्रिय हैं?',
        a: 'SURGE वर्तमान में मुंबई (हिंदमाता, दादर, कुर्ला, अंधेरी), दिल्ली एनसीआर (मिंटो ब्रिज, आईटीओ, पुल प्रह्लादपुर) और चेन्नई (वेलाचेरी, टी. नगर, सैदापेट) के लिए लाइव मॉडल प्रदान करता है।'
      },
      {
        q: 'बाढ़-सुरक्षित आपातकालीन नेविगेशन एपीआई कैसे काम करता है?',
        a: 'सामान्य नेविगेशन ऐप स्थिर सड़क गति सीमाओं का उपयोग करते हैं। SURGE जलभराव गहराई के आधार पर वाहनों को जलमग्न इलाकों से सुरक्षित दूर री-रूट करता है।'
      },
      {
        q: 'नागरिक धरातलीय रिपोर्टिंग में कैसे योगदान दे सकते हैं?',
        a: 'नागरिक और स्वयंसेवक "जलभराव रिपोर्ट" पर टैप करके पानी की गहराई, स्थान और तस्वीरें सबमिट कर सकते हैं।'
      }
    ],
    routing: {
      title: 'बाढ़-सुरक्षित आपातकालीन मार्ग योजनाकार',
      subTitle: 'लाइव हाइड्रोडायनामिक पूर्वानुमान के आधार पर सुरक्षित मार्ग की गणना करता है',
      originPlaceholder: 'प्रारंभिक स्थान / वर्तमान जीपीएस',
      destPlaceholder: 'गंतव्य पता / अस्पताल / आश्रय',
      pickOrigin: 'मानचित्र पर प्रारंभ चुनें',
      pickDest: 'मानचित्र पर गंतव्य चुनें',
      pinned: 'मानचित्र पर चयनित',
      carSedan: 'कार / सेडान',
      ambulance: 'एंबुलेंस (आपातकालीन)',
      autoBike: 'ऑटो / बाइक',
      pedestrian: 'पैदल (वॉक)',
      findRoute: 'सुरक्षित मार्ग खोजें',
      calculating: 'सुरक्षित मार्ग की गणना जारी...',
      distance: 'दूरी',
      eta: 'अनुमानित समय',
      riskScore: 'मार्ग जोखिम',
      riskSafe: 'सुरक्षित मार्ग (0-10 सेमी)',
      riskModerate: 'मध्यम जलभराव (10-25 सेमी)',
      riskHigh: 'उच्च जोखिम (25-45 सेमी)',
      riskImpassable: 'अगम्य (>45 सेमी)',
      turnByTurn: 'सुरक्षित मोड़-दर-मोड़ नेविगेशन',
      noRouteFound: 'वाहन की सीमा से मेल खाता कोई सुरक्षित मार्ग नहीं मिला। वैकल्पिक बिंदु चुनें।',
      pickLocationPrompt: 'स्थान सेट करने के लिए मानचित्र पर क्लिक करें',
      clearRoute: 'मार्ग साफ़ करें',
      vehicleProfileClearance: 'वाहन प्रोफ़ाइल एवं जल क्षमता:',
      maxSafe: 'अधिकतम सुरक्षित:',
      hatchback: 'हैचबैक',
      suv: 'एसयूवी 4x4',
      bus: 'बस / भारी वाहन',
      realRoadSafeRoute: 'SURGE रियल रोड बाढ़-सुरक्षित मार्ग',
      noSafeRouteFor: 'इसके लिए कोई सुरक्षित मार्ग नहीं:',
      selectHazardZone: 'बाढ़ जोखिम क्षेत्र चुनें:',
      nearestShelter: 'निकटतम सुरक्षित राहत शिविर',
      rescueVehicleRoute: 'बचाव वाहन मार्ग',
    },
    alerts: {
      title: 'लाइव आपदा अलर्ट',
      subTitle: 'वास्तविक समय में जलभराव और ड्रेनेज ओवरफ़्लो अलर्ट',
      tabAll: 'सभी अलर्ट',
      tabInundation: 'सड़क जलभराव',
      tabSurcharge: 'पाइप ओवरफ़्लो',
      tabReports: 'नागरिक रिपोर्ट',
      critical: 'गंभीर',
      warning: 'चेतावनी',
      advisory: 'सलाहकार',
      helplineTitle: 'आपातकालीन आपदा हेल्पलाइन',
      ndrfHelpline: 'एनडीआरएफ कंट्रोल रूम',
      controlRoom: 'नगर निगम कंट्रोल रूम',
      disasterLine: 'आपदा आपातकालीन नंबर',
      reportedAgo: 'मिनट पहले',
      verified: 'कंट्रोल रूम द्वारा सत्यापित',
      unverified: 'नागरिक रिपोर्ट (असत्यापित)',
      borough: 'प्रभाग / क्षेत्र',
      elevation: 'ऊंचाई',
      overcapacity: 'क्षमता से अधिक',
      surfaceSpill: 'सतही ओवरफ़्लो',
      hydraulicBackflow: 'हाइड्रोलिक बैकफ़्लो',
      noAlerts: 'इस समय अंतराल के लिए कोई गंभीर जलभराव अनुमानित नहीं है।',
    },
    slider: {
      title: '0–3 घंटे का जलभराव पूर्वाभास टाइमलाइन',
      subTitle: 'जलभराव का पूर्वावलोकन करने के लिए टाइमलाइन स्लाइड करें',
      play: 'सिम्युलेशन चलाएं',
      pause: 'रोकें',
      reset: 'वर्तमान समय',
      nowLive: 'अभी (लाइव)',
      plusMin: 'मिनट',
      plusHour: 'घंटा',
      rainRateLabel: 'वर्षा की तीव्रता:',
      forecastDepthLabel: 'अधिकतम जलभराव:',
    },
    reportModal: {
      title: 'जलभराव की रिपोर्ट दर्ज करें',
      subTitle: 'नगर निगम को वास्तविक समय की जानकारी प्रदान करने में सहायता करें',
      locationLabel: 'स्थान / प्रमुख स्थल',
      depthLabel: 'अनुमानित पानी की गहराई (सेमी)',
      photoLabel: 'तस्वीर अपलोड करें (वैकल्पिक)',
      photoNote: 'जलभराव की तस्वीर क्लिक करें या ड्रैग करें',
      obsLabel: 'अतिरिक्त विवरण',
      obsPlaceholder: 'फंसे हुए वाहन, अवरुद्ध नाले, या आपातकालीन सहायता का उल्लेख करें...',
      helpCheck: 'तुरंत आपातकालीन सहायता की आवश्यकता है',
      submitBtn: 'रिपोर्ट जमा करें',
      submitting: 'रिपोर्ट भेजी जा रही है...',
      cancelBtn: 'रद्द करें',
      successToast: 'रिपोर्ट सफलतापूर्वक नगर निगम कंट्रोल रूम को भेज दी गई!',
    },
    authModal: {
      title: 'आपदा प्रबंधन अधिकारी लॉगिन',
      subTitle: 'भूमिगत टेलीमेट्री, पंप नियंत्रण और रिपोर्ट जनरेटर तक पहुंचें',
      domainLabel: 'प्राधिकरण लॉगिन डोमेन / आईडी',
      domainPlaceholder: 'उदा. mumbai.aqua.gov.in',
      passcodeLabel: 'आधिकारिक एक्सेस पासकोड',
      passcodePlaceholder: '8-अंकीय पासकोड दर्ज करें',
      loginBtn: 'कमांड सेंटर में साइन इन करें',
      loggingIn: 'प्रमाणीकरण जारी...',
      demoNote: 'सभी शहरों के लिए डेमो पासकोड:',
      invalidCredentials: 'अमान्य डोमेन या पासकोड। डेमो पासकोड 12345678 का उपयोग करें।',
    },
    dashboard: {
      title: 'आपदा प्रबंधन कमांड सेंटर',
      subTitle: 'वास्तविक समय नगर निगम बाढ़ टेलीमेट्री और पंप नियंत्रण',
      officerBadge: 'सक्रिय अधिकारी:',
      totalSubmerged: 'जलमग्न सड़क खंड',
      surchargingPipes: 'ओवरफ्लो हो रहे नाले',
      pumpsActive: 'सक्रिय डिवाटरिंग पंप',
      exportSitRep: 'SitRep रिपोर्ट डाउनलोड करें',
      pumpControllerTitle: 'डिवाटरिंग पंप स्टेशन संचालन',
      pumpStatus: 'पंप स्थिति',
      activatePump: 'पंप चालू करें (1500 L/s)',
      deactivatePump: 'स्टैंडबाय मोड',
      groundTruthTitle: 'नागरिक रिपोर्ट सत्यापन',
      verifyBtn: 'सत्यापित करें और कार्रवाई करें',
      dismissBtn: 'खारिज करें',
      statusPending: 'समीक्षा लंबित',
      statusVerified: 'सत्यापित और कार्यवाही की गई',
      statusDismissed: 'खारिज',
      evacRouteBtn: 'निकासी योजना बनाएं',
    },
    sitrep: {
      title: 'स्थिति रिपोर्ट (SitRep) निर्यातक',
      subTitle: 'उच्च अधिकारियों के लिए आधिकारिक बाढ़ स्थिति रिपोर्ट बनाएं',
      generatePdf: 'SitRep PDF डाउनलोड करें',
      downloadCsv: 'टेलीमेट्री CSV निर्यात करें',
      downloadJson: 'टेलीमेट्री JSON निर्यात करें',
      generating: 'रिपोर्ट तैयार हो रही है...',
      summaryHeading: 'कार्यकारी बाढ़ स्थिति सारांश',
      criticalZones: 'मुख्य उच्च जोखिम वाले क्षेत्र:',
    },
    tide: {
      title: 'ज्वार और जल निकाय टेलीमेट्री',
      highTideCountdown: 'अगला उच्च ज्वार समय:',
      nextHighTide: 'उच्चतम ज्वार ऊंचाई:',
      seaLevel: 'समुद्र तल का स्तर:',
      reservoirStorage: 'प्रमुख जलाशय भंडारण:',
      lakesRunway: 'जल आपूर्ति रनवे:',
    },
    drainage: {
      title: 'भूमिगत ड्रेनेज नेटवर्क',
      undergroundGraph: '1D भूमिगत तूफान नाला नेटवर्क',
      coupledSurface: 'सतही रनऑफ',
      pipeDischarge: 'अधिकतम डिस्चार्ज दर',
      capacityUsage: 'नेटवर्क क्षमता उपयोग',
      criticalNodes: 'ओवरफ्लो हो रहे नाले',
    },
    map: {
      layers: 'मानचित्र परतें',
      basemapVector: 'सड़क मानचित्र',
      basemapSat: 'सैटेलाइट मानचित्र',
      inundationMesh: 'जलभराव गहराई',
      pipeGraph: 'ड्रेनेज पाइप नेटवर्क',
      citizenReports: 'नागरिक रिपोर्ट',
      legendTitle: 'पानी की गहराई का संकेत',
      depthSafe: '< 10 सेमी (सुरक्षित)',
      depthModerate: '10 – 25 सेमी (सावधानी)',
      depthHigh: '25 – 45 सेमी (उच्च जोखिम)',
      depthSevere: '> 45 सेमी (अगम्य)',
      surchargingNode: 'मैनहोल ओवरफ्लो',
      safeRoute: 'सुरक्षित वैकल्पिक मार्ग',
      popupRoad: 'सड़क खंड:',
      popupDepth: 'अनुमानित गहराई:',
      popupStatus: 'स्थिति:',
      popupPassable: 'वाहनों के लिए योग्य',
      popupImpassable: 'जलमग्न - मार्ग से बचें',
    },
    evacuationModal: {
      title: 'आपातकालीन निकासी एवं मार्गदर्शन योजना',
      subTitle: 'आपकी वाहन क्षमता के आधार पर चरण-दर-चरण सुरक्षित मार्ग निर्देश',
      selectVehicle: 'अपना वाहन प्रकार चुनें:',
      hazardZone: 'सक्रिय बाढ़ जोखिम क्षेत्र',
      shelterHeading: 'निकटतम सुरक्षित राहत शिविर',
      elevationGain: 'ऊंचाई लाभ',
      stepByStepHeading: 'चरण-दर-चरण निकासी योजना',
      step1Title: 'चरण 1: त्वरित तैयारी एवं जल निकासी सीमा जांच',
      step2Title: 'चरण 2: जलमग्न रास्तों और अंडरपास से बचाव',
      step3Title: 'चरण 3: मोड़-दर-मोड़ सुरक्षित मार्ग निर्देश',
      step4Title: 'चरण 4: राहत केंद्र में आगमन और सहायता पंजीकरण',
      deployMapBtn: 'जीआईएस मानचित्र पर सुरक्षित मार्ग चालू करें',
      closeBtn: 'योजना बंद करें',
    },
    citizenApp: {
      appTitle: 'SURGE नागरिक पोर्टल',
      appSubtitle: 'सड़क जलभराव अलर्ट, लाइव जीपीएस सुरक्षित नेविगेशन एवं रिपोर्टिंग',
      tabGis: 'जीआईएस मानचित्र व परतें',
      tabAlerts: 'लाइव आपदा अलर्ट',
      tabRoute: 'वाहन-सुरक्षित मार्ग',
      tabReport: 'जलभराव रिपोर्ट दर्ज करें',
      useLiveGps: 'मेरी लाइव जीपीएस स्थिति का उपयोग करें',
      gpsAcquired: 'लाइव जीपीएस स्थिति प्राप्त हुई',
      gpsDenied: 'जीपीएस अनुमति नहीं मिली',
      locateMe: 'मेरी स्थिति खोजें',
      launchCitizenApp: 'सिटीजन ऐप खोलें',
      tabEmergency: 'आपातकालीन संपर्क',
    },
    emergencyServices: {
      title: 'भारतीय आपातकालीन हेल्पलाइन',
      subTitle: 'आपदा राहत और चिकित्सा सहायता के लिए 1-टैप टोल-फ्री नंबर',
      callNow: 'कॉल करें',
      tollFree: '24x7 टोल-फ्री',
      ndrfTitle: 'एनडीआरएफ आपदा प्रतिक्रिया नियंत्रण कक्ष',
      ndrfDesc: 'राष्ट्रीय आपदा मोचन बल (NDRF) बाढ़ बचाव, नाव निकासी और क्लाउडबर्स्ट राहत कार्य।',
      national112Title: 'अखिल भारतीय एकीकृत आपातकालीन नंबर',
      national112Desc: 'सभी भारतीय राज्यों और केंद्र शासित प्रदेशों के लिए एकल आपातकालीन प्रतिक्रिया नंबर।',
      municipal1916Title: 'नगर निगम आपदा प्रबंधन नियंत्रण कक्ष',
      municipal1916Desc: 'नगर निगम (BMC/NDMC/GCC) शहरी बाढ़ हेल्पलाइन, जलभराव और पंप संचालन।',
      ambulance108Title: 'आपातकालीन चिकित्सा और एम्बुलेंस सेवा',
      ambulance108Desc: 'निःशुल्क आपातकालीन चिकित्सा एम्बुलेंस, आघात प्रतिक्रिया और बाढ़ रोगी परिवहन।',
      fire101Title: 'फायर ब्रिगेड और जल बचाव दल',
      fire101Desc: 'जलमग्न अंडरपास से वाहन निकालना और बाढ़ प्रभावित नागरिकों का बचाव।',
      police100Title: 'पुलिस नियंत्रण कक्ष और यातायात पुलिस',
      police100Desc: 'आपातकालीन कानून व्यवस्था, जलभराव वाली सड़कों पर यातायात डायवर्जन।',
      coastal1093Title: 'तटीय सुरक्षा और उच्च ज्वार गश्त',
      coastal1093Desc: 'भारतीय तटरक्षक बल और तटीय क्षेत्रों में ज्वारीय बाढ़ आपातकालीन सहायता।',
    },
    voiceNav: {
      voiceGuide: 'वॉइस नेविगेशन',
      speaking: 'ऑडियो चल रहा है...',
      stopVoice: 'वॉइस बंद करें',
      inMeters: '{distance} मीटर में',
      turnLeft: 'बायें मुड़ें',
      turnRight: 'दायें मुड़ें',
      proceedStraight: 'सीधे चलें',
      hazardWarning: 'चेतावनी! आगे जलमग्न अंडरपास है। वैकल्पिक मार्ग लें।',
      destinationArrived: 'आप अपने सुरक्षित उच्च-ऊंचाई वाले आश्रय स्थल पर पहुँच गए हैं।',
    },
    sidebar: {
      nowcastGis: 'जीआईएस बाढ़ मानचित्र',
      hydroRouting: 'हाइड्रो रूटिंग',
      citizenSignals: 'नागरिक संकेत',
      adminModeration: 'समीक्षा कतार',
      waterBodies: 'जल निकाय मानचित्र',
      simulationReplay: 'सिम्युलेशन रीप्ले',
      authorityMode: 'प्राधिकरण मोड',
    },
    simulation: {
      title: 'रियल-टाइम हाइड्रोलिक रनऑफ सिम्युलेशन रीप्ले',
      subTitle: 'ऐतिहासिक मानसून बारिश और ड्रेनेज नेटवर्क क्षमता का परीक्षण करें',
      benchmarkTitle: 'ऐतिहासिक बेंचमार्क रीप्ले',
      selectScenario: 'वर्षा परिदृश्य चुनें',
      rainIntensity: 'वर्षा की तीव्रता',
      solverTelemetry: 'हाइड्रोलिक सॉल्वर टेलीमेट्री',
      runReplay: 'सिम्युलेशन चलाएं',
      pauseReplay: 'रोकें',
      resetReplay: 'रीसेट करें',
      historicalBenchmarks: 'ऐतिहासिक वर्षा रिकॉर्ड',
    },
    adminModeration: {
      portalBadge: 'नगर निगम कमांड एवं मॉडरेशन पोर्टल',
      title: 'ड्रेनेज रुकावट एवं टीम प्रेषण डेस्क',
      subTitle: 'नागरिकों द्वारा रिपोर्ट की गई रुकावटों और सीवर बैकफ्लो का सत्यापन करें। रिपोर्ट को मंजूरी देने से बाढ़ मॉडल में स्वचालित रूप से क्षमता अपडेट होती है।',
      syncQueue: 'कतार सिंक करें',
      pendingOperator: 'ऑपरेटर समीक्षा लंबित',
      awaitingTriage: 'समीक्षा की प्रतीक्षा में',
      crowdsourcedReports: 'नागरिक रिपोर्ट',
      validatedBottlenecks: 'सत्यापित रुकावटें',
      activeHotspots: 'सक्रिय हॉटस्पॉट',
      flowVelocities: 'जल प्रवाह दर को प्रभावित कर रहा है',
      clogsCleared: 'रुकावटें साफ़ की गईं',
      fullyRestored: 'पूर्णतः बहाल',
      desiltingCompleted: 'सफाई दल ने काम पूरा किया',
      meshMultiplier: 'हाइड्रोलिक मैश गुणक',
      capacity: 'क्षमता',
      swmmCalibration: 'रियल-टाइम SWMM अंशांकन',
      triageStream: 'समीक्षा एवं प्रेषण स्ट्रीम',
      pending: 'लंबित',
      validated: 'सत्यापित',
      resolved: 'समाधान हुआ',
      allReports: 'सभी रिपोर्ट',
      noReports: 'इस श्रेणी में कोई रिपोर्ट नहीं है। प्रणाली सामान्य रूप से काम कर रही है।',
      reporter: 'रिपोर्टर',
      coordinates: 'निर्देशांक',
      verifiedBy: 'द्वारा सत्यापित',
      verifyRestrict: 'सत्यापित करें और सीमित करें',
      dispatchCrew: 'टीम भेजें और समाधान करें',
      clogCleared: 'रुकावट साफ़ हुई',
    },
    chatbot: {
      title: 'SURGE AI ऑपरेशंस डेस्क',
      liveScada: 'लाइव स्कैडा और टेलीमेट्री एकीकृत',
      quotaLabel: 'कोटा',
      minimizeModal: 'छोटा करें',
      expandModal: 'बड़ा करें',
      clearHistory: 'चैट इतिहास साफ़ करें',
      closeModal: 'चैट बंद करें',
      rateLimitActive: 'सीमा समाप्त। कोटा पुनः सेट होगा:',
      suggestedQueries: 'सुझाए गए प्रश्न:',
      inputPlaceholder: 'सड़क सुरक्षा, रडार, जलभराव के बारे में पूछें...',
      sendBtn: 'भेजें',
      vehicleSafetyCat: 'वाहन सुरक्षा',
      vehicleSafetyQuery: 'क्या हैचबैक या सेडान 35 सेमी जलभराव वाली सड़कों से सुरक्षित गुजर सकती है?',
      radarCat: 'रडार और पूर्वानुमान',
      radarQuery: 'SURGE डॉपलर रडार को 1D ड्रेनेज के साथ कैसे जोड़ता है?',
      evacuationCat: 'निकासी',
      evacuationQuery: 'मैं निकटतम उच्च-ऊंचाई वाले बाढ़ राहत शिविर का पता कैसे लगाऊं?',
      scadaCat: 'स्कैडा टेलीमेट्री',
      scadaQuery: 'लाइव ओवरफ्लो अलर्ट और ज्वार के स्तर का क्या अर्थ है?',
    },
    citizenSignal: {
      groundTruthBadge: 'नागरिक धरातलीय स्तर',
      swmmModelFeedback: 'प्रत्यक्ष SWMM मॉडल फीडबैक',
      title: 'ड्रेनेज रुकावट एवं जलभराव सिग्नल डेस्क',
      subTitle: 'अवरुद्ध नालियों और जलभराव की वास्तविक समय में रिपोर्ट करें। सत्यापित रिपोर्ट ड्रेनेज नेटवर्क क्षमता को अपडेट करती हैं।',
      cityCapacityFactor: 'शहर की हाइड्रोलिक क्षमता दर',
      activeHotspots: 'सक्रिय सत्यापित हॉटस्पॉट',
      submitHazardHeader: 'जोखिम अवलोकन दर्ज करें',
      locationSub: 'निर्देशांक निकटतम नगर निगम मैनहोल से स्वचालित रूप से जुड़े हैं।',
      incidentLocation: 'घटना का स्थान:',
      autoGps: 'ऑटो जीपीएस',
      detecting: 'खोज रहा है...',
      nearestManhole: 'निकटतम ड्रेनेज मैनहोल:',
      selectCategory: 'जोखिम श्रेणी चुनें:',
      waterlogging: 'सड़क जलभराव',
      blockedInlet: 'अवरुद्ध नाली',
      drainOverflow: 'नाला ओवरफ्लो',
      sewerBackflow: 'सीवर बैकफ़्लो',
      severityLabel: 'अनुमानित रुकावट की गंभीरता:',
      penalty: 'पेनल्टी',
      reportTitle: 'रिपोर्ट का शीर्षक:',
      titlePlaceholder: 'उदा. कचरे से अवरुद्ध नाली',
      notesLabel: 'अवलोकन विवरण:',
      notesPlaceholder: 'पानी की गहराई, यातायात रुकावट का वर्णन करें...',
      attachPhoto: 'साक्ष्य तस्वीर संलग्न करें:',
      clearPhoto: 'हटाएं',
      sampleClogPhoto: 'नमूना रुकावट फोटो',
      sampleFloodPhoto: 'नमूना बाढ़ फोटो',
      photoAttached: 'फोटो संलग्न',
      reporterHandle: 'रिपोर्टर नाम / वार्ड:',
      reporterPlaceholder: 'उदा. KurlaResident_WardL',
      submitBtn: 'धरातलीय रिपोर्ट जमा करें',
      liveStreamHeader: 'लाइव नागरिक रुकावट स्ट्रीम',
      crowdObsSub: 'हाइड्रोलॉजिस्ट द्वारा सत्यापित वास्तविक समय की रिपोर्ट।',
      statusLabel: 'स्थिति:',
      allReports: 'सभी रिपोर्ट',
      photoEvidence: 'फोटोग्राफिक साक्ष्य',
      verifiedByBmc: 'बीएमसी द्वारा सत्यापित',
    },
    hydroRouting: {
      engineBadge: 'डायनामिक हाइड्रो-रूटिंग इंजन',
      scadaChainValidated: 'SHA-256 स्कैडा श्रृंखला सत्यापित',
      title: 'जलभराव विचलन एवं बफर मैट्रिक्स',
      subTitle: 'जलभराव वाले चौराहों से पानी को सीवेज ट्रीटमेंट प्लांट (STP), भूजल पुनर्भरण कुओं और जलाशयों की ओर स्वचालित रूप से मोड़ना।',
      triggerAutoDiversion: 'ऑटो-डायवर्जन मैट्रिक्स चलाएं',
      executingDiversion: 'डायवर्जन लागू किया जा रहा है...',
      syncBtn: 'सिंक',
      divertedVolume: 'मोड़ा गया जल आयतन',
      activeBypassFlow: 'सक्रिय बाईपास प्रवाह:',
      activeSluiceGates: 'सक्रिय स्लूस गेट',
      gatesOpen: 'खुले हुए गेट',
      scadaStatus: 'स्कैडा स्थिति:',
      allResponding: 'सभी कार्यरत',
      bufferHeadroom: 'उपलब्ध बफर क्षमता',
      storageRemaining: 'जलाशयों में शेष भंडारण क्षमता',
      systemAuditLog: 'सिस्टम ऑडिट लॉग',
      tamperProof: 'छेड़छाड़-मुक्त',
      sluiceRegistryTitle: 'नगर निगम सिंक और गेट रजिस्ट्री',
      infrastructureSub: 'अतिरिक्त बाढ़ के पानी को प्राप्त करने में सक्षम सत्यापित बुनियादी ढांचा।',
      filterSink: 'फ़िल्टर करें:',
      allSinks: 'सभी पंजीकृत सिंक',
      stpSinks: 'एसटीपी / एसटीपी टैंक',
      marSinks: 'भूजल पुनर्भरण कुएं',
      lakeSinks: 'शहरी झीलें',
      storageFill: 'वर्तमान भंडारण भराव',
      intakeFlow: 'प्रवेश प्रवाह',
      sluiceGate: 'स्लूस गेट',
      adjustActuator: 'गेट स्थिति समायोजित करें',
      scadaAuditLedger: 'स्कैडा संचालन ऑडिट लेजर',
      genesisToHead: 'प्रत्येक गेट संचालन को सत्यापित करने वाली सुरक्षित SHA-256 क्रिप्टोग्राफिक श्रृंखला।',
      blocksVerified: 'ब्लॉक सत्यापित',
      blockIndex: 'ब्लॉक #',
      prevHash: 'पिछला हैश:',
      overrideModalTitle: 'स्कैडा स्लूस गेट ओवरराइड',
      targetInfrastructure: 'लक्ष्य सिंक ढांचा:',
      gatePosition: 'गेट स्थिति:',
      openLabel: 'खुला',
      closedLabel: 'बंद',
      operationalJustification: 'संचालन औचित्य (ऑन-चेन दर्ज):',
      auditLogNotice: 'यह बदलाव SHA-256 के साथ हैश किया जाएगा और लेजर में जोड़ा जाएगा।',
      cancelBtn: 'रद्द करें',
      signDispatchBtn: 'साइन और लागू करें',
    },
    nowcast: {
      title: 'एआई बाढ़ पूर्वाभास',
      deepseekBadge: 'Qwen 2.5 3B',
      fallbackBadge: 'फॉलबैक',
      predicting: 'पूर्वानुमान जारी...',
      refreshBtn: 'रिफ्रेश',
      runPredictionBtn: 'पूर्वानुमान चलाएं',
      emptyStatePrompt: 'डॉपलर रडार और मौसम डेटा का उपयोग करके बाढ़ पूर्वाभास उत्पन्न करने के लिए पूर्वानुमान चलाएं पर क्लिक करें।',
      reasoningSensorData: 'सेंसर डेटा पर एआई विश्लेषण जारी...',
      riskSuffix: 'जोखिम',
      confidenceSuffix: 'सटीकता',
      outlookHeading: 'आउटलुक',
      nowLabel: 'अभी',
      keyRisksHeading: 'मुख्य जोखिम',
      recommendationHeading: 'सिफारिश',
      aiReasoningHeading: 'एआई तर्क',
      sensorInputsHeading: 'सेंसर इनपुट',
    },
    precipitationBadge: {
      liveRadar: 'लाइव रडार',
      modelEstimate: 'मॉडल अनुमान (फॉलबैक)',
      noData: 'कोई रडार डेटा उपलब्ध नहीं',
      lastUpdated: 'अंतिम अपडेट',
      decodeConfidence: 'सटीकता दर',
      stationCode: 'स्टेशन कोड',
      freshness: 'ताज़गी',
      freshLabel: 'ताज़ा (10 मिनट के भीतर)',
      staleLabel: 'पुराना',
      source: 'स्रोतः',
    },
    waterAtlas: {
      atlasBadge: 'जल निकाय एवं कैचमेंट मानचित्र',
      coastalSyncBadge: 'तटीय गेट सिंक',
      title: 'शहरी झीलें एवं तटीय ज्वार नियंत्रण',
      subTitle: 'शहरी झीलों में पानी का स्तर, अतिक्रमण सूचकांक और ज्वार चक्र के साथ समन्वयित स्वचालित गेट।',
      highTidePeak: 'उच्च ज्वार शिखर (मुंबई पोर्ट)',
      flapGateLockout: 'फ्लैप गेट लॉकआउट:',
      preventsBackflow: 'समुद्री पानी के बैकफ़्लो को रोकता है',
      urbanReservoirsHeading: 'शहरी जलाशय एवं झील क्षमताएं',
      totalBufferHeadroom: 'कुल बाढ़ बफर क्षमता:',
      FTL: 'पूर्ण टैंक स्तर (FTL)',
      storage: 'भंडारण',
      cushion: 'शेष स्थान',
      encroachment: 'अतिक्रमण:',
      priority: 'प्राथमिकता:',
      coastalOutfallsHeading: 'तटीय आउटफॉल एवं बैकफ़्लो लॉकआउट',
      tidalFlapSub: 'उच्च ज्वार के दौरान तटीय गेट स्वतः बंद हो जाते हैं ताकि समुद्र का पानी सड़कों पर न आए।',
      dischargeRate: 'डिस्चार्ज दर',
      seaInvertHead: 'समुद्र तल हेड',
    },
    splash: {
      loadingLabel: 'SURGE प्लेटफॉर्म लोड हो रहा है',
      title: 'SURGE',
      subtitle: 'शहरी बाढ़ पूर्वानुमान प्रणाली',
    },
    simulationTutorial: {
      bannerTitle: 'सिम्युलेशन सुरक्षा बैनर',
      bannerText: 'हमेशा शीर्ष सुरक्षा बैनर की जांच करें - यह माहौल ऐतिहासिक बाढ़ घटनाओं का रीप्ले है।',
      selectorTitle: 'शहर एवं घटना चयनकर्ता',
      selectorText: 'शहरों (मुंबई, दिल्ली, चेन्नई) के बीच स्विच करें और 9 ऐतिहासिक बारिश घटनाओं में से चुनें।',
      controlsTitle: 'इंटरैक्टिव टाइमलाइन रीप्ले नियंत्रण',
      controlsText: 'प्ले/पॉज़ और स्पीड नियंत्रण का उपयोग करके 9-चरणीय बाढ़ प्रगति को फिर से चलाएं।',
      provenanceTitle: 'डेटा स्रोत और एआई विश्लेषण',
      provenanceText: 'मौसम विज्ञान रिकॉर्ड और एआई निर्णय विश्लेषण का चरण-दर-चरण सत्यापन करें।',
      mapTitle: 'हाइड्रोलिक जीआईएस मानचित्र',
      mapText: 'मानचित्र पर जलभराव की अनुमानित गहराई और उच्च जोखिम वाले हॉटस्पॉट देखें।',
      nextBtn: 'आगे',
      finishBtn: 'समाप्त',
      skipBtn: 'छोड़ें',
      stepOf: 'चरण',
    },
    common: {
      panelTab: 'पैनल',
      gisMapTab: 'जीआईएस मानचित्र',
      loadingGis: 'जीआईएस मानचित्र इंजन लोड हो रहा है...',
      loadingCitizenApp: 'सिटीजन ऐप लोड हो रहा है...',
      loadingOperationsHub: 'ऑपरेशंस हब लोड हो रहा है...',
    },
  },

  mr: {
    nav: {
      brand: 'SURGE',
      subTitle: 'नागरी पूर पूर्वसूचना पोर्टल',
      backToLanding: 'मुख्य पृष्ठावर जा',
      openMeteoApi: 'ओपन-मिशिओ एपीआय',
      liveWeather: 'लाइव्ह हवामान',
      maxDepth: 'कमाल खोली',
      reportWater: 'पाण्याची नोंद करा',
      authorityCenter: 'प्राधिकरण कमांड सेंटर',
      authorityPortal: 'प्राधिकरण पोर्टल',
      selectCity: 'शहर निवडा',
      selectEvent: 'पाऊस प्रकार निवडा',
      lakes7: '7 तलाव: 87%',
      reservoirs5: '5 जलाशय: 82%',
      yamunaStage: 'यमुना पातळी: 204.8m',
    },
    landing: {
      fullForm: 'अति-स्थानिक ट्रॅकिंग आणि हस्तक्षेपासाठी अतिवृष्टी व पूर नियंत्रण प्रणाली',
      citizenDashboardBtn: 'नागरिक डॅशबोर्ड',
      leadTimeBadge: '0–3 तास आगाऊ अंदाज वेळ',
      heroTitle: 'पृष्ठभाग आणि भूगर्भातील एकात्मिक पूर बुद्धिमत्ता',
      heroSubtitle: 'रस्त्यावरील पाण्याची खोली, मॅनहोलचे पाठीमागचे पाणी आणि पूर-सुरक्षित आपत्कालीन मार्गांचा रिअल-टाइम अंदाज लावा.',
      metricLeadTime: '0–3 तास',
      metricHydraulics: '1D + 2D',
      metricPrecision: 'रस्ता-पातळी',
      metricDetours: '100%',
      metricLeadTimeSub: 'पूर्वसूचना वेळ',
      metricHydraulicsSub: 'एकात्मिक हायड्रोलिक्स',
      metricPrecisionSub: 'खोली अचूकता (सेमी)',
      metricDetoursSub: 'डायनॅमिक सुरक्षित मार्ग',
      selectCityTitle: 'मेट्रो सिटी कमांड सेंटर निवडा',
      selectCitySub: 'जीआयएस पूर माहितीपट पाहण्यासाठी खालील शहर निवडा',
      liveRadar: 'लाइव्ह रडार',
      highRiskHotspots: 'उच्च धोक्याची क्षेत्रे:',
      authorityLoginDomain: 'प्राधिकरण लॉगिन:',
      launchDashboard: 'डॅशबोर्ड उघडा',
      authorityLoginBtn: 'प्राधिकरण लॉगिन',
      simTitle: 'इंटरॅक्टिव्ह पावसाचे पाणी सिम्युलेटर',
      simSub: 'रस्त्यावरील पाण्याचा अंदाज तपासण्यासाठी पावसाची तीव्रता बदला',
      simRainRate: 'सिम्युलेटेड पाऊस दर:',
      moderate: 'मध्यम (15 मिमी/तास)',
      heavy: 'मुसळधार (45 मिमी/तास)',
      cloudburst: 'ढगफुटी (85 मिमी/तास)',
      predictedDepth: 'अंदाजित पाण्याची खोली:',
      underpassLocation: 'सखल सबवे येथे',
      capacityExceeded: 'ड्रेनेज क्षमतेपेक्षा जास्त (>100%). रस्त्यावर पाण्याचा फुगवटा.',
      capacityAdequate: 'ड्रेनेज क्षमता पुरेशी आहे.',
      faqTitle: 'सतत विचारले जाणारे प्रश्न',
      faqBadge: 'महत्त्वाचे प्रश्न',
      faqMainHeading: 'SURGE बद्दल सर्व काही',
      footerTitle: 'SURGE • नागरी पूर हायड्रो-डायनॅमिक अंदाज प्रणाली',
      footerSub: 'पृथ्वी विज्ञान मंत्रालय (MoES) • राष्ट्रीय मध्यम कालावधी हवामान अंदाज केंद्र (NCMRWF)',
      feature1Title: 'एकात्मिक 1D + 2D हायड्रोलिक्स',
      feature1Sub: 'डॉपलर रडारचा पाऊस अंदाज, 2D रस्ता पातळी व 1D भूगर्भातील गटार नेटवर्क एकत्र करतो.',
      feature2Title: 'पूर-सुरक्षित नेव्हिगेशन एपीआई',
      feature2Sub: 'पाण्याखालील रस्ते व सबवे टाळून वाहनांना सुरक्षित वळणावर री-रूट करतो.',
      feature3Title: 'आपत्ती अहवाल (SitRep) निर्यातक',
      feature3Sub: 'आपत्ती व्यवस्थापन टीमला पंप नियंत्रण व अधिकृत अहवाल डाउनलोड सुविधा देतो.',
    },
    faqs: [
      {
        q: 'महापालिका अधिकारी लॉगिन कसे करतात?',
        a: 'अधिकृत अधिकारी त्यांच्या शहर डोमेनने (उदा. mumbai.aqua.gov.in) आणि पासकोड 12345678 वापरून लॉगिन करतात.'
      },
      {
        q: 'SURGE 0–3 तास आधी पुराचा अंदाज कसा लावतो?',
        a: 'SURGE थेट डॉपलर रडार, 2D डिजिटल एलिव्हेशन मॉडेल (DEM) आणि 1D भूगर्भातील गटार नेटवर्क एकत्र करून अचूक अंदाज देतो.'
      },
      {
        q: 'कोणती भारतीय शहरे समाविष्ट आहेत?',
        a: 'मुंबई (हिंदमाता, दादर, कुर्ला, अंधेरी), दिल्ली एनसीआर (मिंटो ब्रिज, आयटीओ) आणि चेन्नई (वेलाचेरी, टी नगर).'
      },
      {
        q: 'सुरक्षित नेव्हिगेशन कसे कार्य करते?',
        a: 'SURGE पाण्याच्या खोलीनुसार वाहनांना पुराच्या भागातून सुरक्षित वळणावर री-रूट करतो.'
      },
      {
        q: 'नागरिक माहिती कशी सादर करू शकतात?',
        a: '"पाण्याची नोंद करा" बटणावर क्लिक करून नागरिक फोटो आणि खोली नोंदवू शकतात.'
      }
    ],
    routing: {
      title: 'पूर-सुरक्षित आपत्कालीन मार्ग नियोजक',
      subTitle: 'लाइव्ह पुराच्या अंदाजानुसार सुरक्षित मार्ग शोधतो',
      originPlaceholder: 'सुरुवातीचे ठिकाण / वर्तमान स्थान',
      destPlaceholder: 'गंतव्य स्थान / रुग्णालय / निवारा',
      pickOrigin: 'नकाशावर निवडा',
      pickDest: 'गंतव्य निवडा',
      pinned: 'नकाशावर निश्चित केले',
      carSedan: 'कार / सेडान',
      ambulance: 'ॲम्ब्युलन्स (आपत्कालीन)',
      autoBike: 'रिक्षा / बाईक',
      pedestrian: 'पायी (वॉक)',
      findRoute: 'सुरक्षित मार्ग शोधा',
      calculating: 'मार्ग शोधत आहे...',
      distance: 'अंतर',
      eta: 'अंदाजित वेळ',
      riskScore: 'मार्ग धोका',
      riskSafe: 'सुरक्षित मार्ग (0-10 सेमी)',
      riskModerate: 'मध्यम पाणी (10-25 सेमी)',
      riskHigh: 'उच्च धोका (25-45 सेमी)',
      riskImpassable: 'अगम्य (>45 सेमी)',
      turnByTurn: 'सुरक्षित वळण-दर-वळण मार्गदर्शन',
      noRouteFound: 'सुरक्षित मार्ग सापडला नाही. कृपया इतर ठिकाण निवडा.',
      pickLocationPrompt: 'स्थान निवडण्यासाठी नकाशावर क्लिक करा',
      clearRoute: 'मार्ग हटवा',
      vehicleProfileClearance: 'वाहन प्रोफाइल आणि जल क्षमता:',
      maxSafe: 'कमाल सुरक्षित:',
      hatchback: 'हॅचबॅक',
      suv: 'एसयूव्ही 4x4',
      bus: 'बस / अवजड वाहन',
      realRoadSafeRoute: 'SURGE रिअल रोड पूर-सुरक्षित मार्ग',
      noSafeRouteFor: 'या वाहनासाठी सुरक्षित मार्ग उपलब्ध नाही:',
      selectHazardZone: 'पूर धोक्याचा भाग निवडा:',
      nearestShelter: 'जवळचे सुरक्षित आपत्कालीन निवारा केंद्र',
      rescueVehicleRoute: 'बचाव वाहन मार्ग',
    },
    alerts: {
      title: 'लाइव्ह आपत्कालीन इशारे',
      subTitle: 'रिअल-टाइम पाणी साचणे व ड्रेनेज ओव्हरफ्लो सूचना',
      tabAll: 'सर्व इशारे',
      tabInundation: 'रस्त्यावरील पाणी',
      tabSurcharge: 'गटार ओव्हरफ्लो',
      tabReports: 'नागरिक नोंदी',
      critical: 'अतिधोकादायक',
      warning: 'इशारा',
      advisory: 'सूचना',
      helplineTitle: 'आपत्कालीन मदत क्रमांक',
      ndrfHelpline: 'एनडीआरएफ नियंत्रण कक्ष',
      controlRoom: 'महापालिका नियंत्रण कक्ष',
      disasterLine: 'आपत्ती व्यवस्थापन हेल्पलाइन',
      reportedAgo: 'मिनिटांपूर्वी',
      verified: 'नियंत्रण कक्षाद्वारे सत्यापित',
      unverified: 'नागरिक नोंद (अतपासलेली)',
      borough: 'विभाग / भाग',
      elevation: 'उंची',
      overcapacity: 'क्षमेतेपेक्षा जास्त',
      surfaceSpill: 'रस्त्यावर पाण्याचा फुगवटा',
      hydraulicBackflow: 'गटार बॅकफ्लो',
      noAlerts: 'या कालावधीत कोणताही गंभीर पुराचा धोका नाही.',
    },
    slider: {
      title: '0–3 तास पूर अंदाज टाइमलाइन',
      subTitle: 'पुराचा अंदाज पाहण्यासाठी स्लाइडर हलवा',
      play: 'सुरू करा',
      pause: 'थांबवा',
      reset: 'सध्याची वेळ',
      nowLive: 'आत्ता (लाइव्ह)',
      plusMin: 'मि',
      plusHour: 'तास',
      rainRateLabel: 'पावसाचा वेग:',
      forecastDepthLabel: 'कमाल खोली:',
    },
    reportModal: {
      title: 'पाण्याच्या खोलीची नोंद करा',
      subTitle: 'महापालिकेला रिअल-टाइम माहिती देण्यास मदत करा',
      locationLabel: 'ठिकाण / खूण',
      depthLabel: 'पाण्याची खोली (सेमी)',
      photoLabel: 'फोटो अपलोड करा (पर्यायी)',
      photoNote: 'पाणी साचल्याचा फोटो निवडा',
      obsLabel: 'अधिक माहिती',
      obsPlaceholder: 'अडकलेली वाहने, तुंबलेली गटारे याबद्दल सांगा...',
      helpCheck: 'तातडीच्या मदतीची गरज आहे',
      submitBtn: 'माहिती पाठवा',
      submitting: 'पाठवत आहे...',
      cancelBtn: 'रद्द करा',
      successToast: 'माहिती यशस्वीरीत्या महापालिका नियंत्रण कक्षाकडे पाठवली!',
    },
    authModal: {
      title: 'आपत्ती व्यवस्थापन अधिकारी लॉगिन',
      subTitle: 'भूगर्भातील माहिती आणि पंप नियंत्रणासाठी लॉगिन करा',
      domainLabel: 'प्राधिकरण डोमेन / आयडी',
      domainPlaceholder: 'उदा. mumbai.aqua.gov.in',
      passcodeLabel: 'पासकोड',
      passcodePlaceholder: '८ अंकी पासकोड टाका',
      loginBtn: 'लॉगिन करा',
      loggingIn: 'तपासत आहे...',
      demoNote: 'डेमो पासकोड:',
      invalidCredentials: 'चुकीचा पासकोड. डेमो पासकोड 12345678 वापरा.',
    },
    dashboard: {
      title: 'आपत्ती व्यवस्थापन कमांड सेंटर',
      subTitle: 'रिअल-टाइम महापालिका पूर नियंत्रण आणि पंप व्यवस्थापन',
      officerBadge: 'सक्रिय अधिकारी:',
      totalSubmerged: 'पाण्याखालील रस्ते',
      surchargingPipes: 'ओव्हरफ्लो गटारे',
      pumpsActive: 'सुरू असलेले पंप',
      exportSitRep: 'SitRep अहवाल डाउनलोड करा',
      pumpControllerTitle: 'पंप स्टेशन नियंत्रण',
      pumpStatus: 'पंप स्थिती',
      activatePump: 'पंप सुरू करा (1500 L/s)',
      deactivatePump: 'स्टैंडबाय मोड',
      groundTruthTitle: 'नागरिक नोंदींची पडताळणी',
      verifyBtn: 'सत्यापित करा',
      dismissBtn: 'रद्द करा',
      statusPending: 'प्रलंबित',
      statusVerified: 'सत्यापित केले',
      statusDismissed: 'रद्द केले',
      evacRouteBtn: 'स्थलांतर योजना तयार करा',
    },
    sitrep: {
      title: 'परिस्थिती अहवाल (SitRep) निर्यातक',
      subTitle: 'वरिष्ठ अधिकाऱ्यांसाठी अधिकृत पूर अहवाल तयार करा',
      generatePdf: 'SitRep PDF डाउनलोड करा',
      downloadCsv: 'CSV डेटा निर्यात करा',
      downloadJson: 'JSON डेटा निर्यात करा',
      generating: 'अहवाल तयार होत आहे...',
      summaryHeading: 'पूर परिस्थितीचा सारांश',
      criticalZones: 'मुख्य धोकादायक क्षेत्रे:',
    },
    tide: {
      title: 'उधाणाची भरती व जलसाठा',
      highTideCountdown: 'पुढील भरती वेळ:',
      nextHighTide: 'भरतीची उंची:',
      seaLevel: 'समुद्र पातळी:',
      reservoirStorage: 'प्रमुख जलसाठा:',
      lakesRunway: 'पाणी पुरवठा दिवस:',
    },
    drainage: {
      title: 'भूगर्भातील गटार नेटवर्क',
      undergroundGraph: '१D भूगर्भातील नाले',
      coupledSurface: 'पृष्ठभागावरील पाणी',
      pipeDischarge: 'कमाल प्रवाह दर',
      capacityUsage: 'क्षमता वापर',
      criticalNodes: 'ओव्हरफ्लो मॅनहोल्स',
    },
    map: {
      layers: 'नकाशा स्तर',
      basemapVector: 'रस्ता नकाशा',
      basemapSat: 'सॅटेलाइट नकाशा',
      inundationMesh: 'पाण्याची खोली',
      pipeGraph: 'गटार नेटवर्क',
      citizenReports: 'नागरिक नोंदी',
      legendTitle: 'पाण्याच्या खोलीचे रंग',
      depthSafe: '< 10 सेमी (सुरक्षित)',
      depthModerate: '10 – 25 सेमी (काळजी घ्या)',
      depthHigh: '25 – 45 सेमी (धोकादायक)',
      depthSevere: '> 45 सेमी (अगम्य)',
      surchargingNode: 'मॅनहोल ओव्हरफ्लो',
      safeRoute: 'सुरक्षित पर्याय मार्ग',
      popupRoad: 'रस्ता:',
      popupDepth: 'अंदाजित खोली:',
      popupStatus: 'स्थिती:',
      popupPassable: 'वाहनांसाठी योग्य',
      popupImpassable: 'पाणी साचले आहे - टाळा',
    },
    evacuationModal: {
      title: 'आपत्कालीन स्थलांतर व मार्गदर्शन योजना',
      subTitle: 'तुमच्या वाहनाच्या क्षमतेनुसार टप्पा-दर-टप्पा सुरक्षित मार्ग मार्गदर्शन',
      selectVehicle: 'तुमचा वाहन प्रकार निवडा:',
      hazardZone: 'सक्रिय पूर धोका क्षेत्र',
      shelterHeading: 'जवळचे सुरक्षित आपत्कालीन निवारा केंद्र',
      elevationGain: 'उंची वाढ',
      stepByStepHeading: 'टप्पा-दर-टप्पा स्थलांतर मार्ग योजना',
      step1Title: 'टप्पा १: तातडीची तयारी व पाणी पातळी तपासणी',
      step2Title: 'टप्पा २: पाण्याखालील रस्ते व सबवे टाळा',
      step3Title: 'टप्पा ३: वळण-दर-वळण सुरक्षित मार्ग निर्देश',
      step4Title: 'टप्पा ४: निवारा केंद्रात आगमन व मदत नोंदणी',
      deployMapBtn: 'नकाशावर सुरक्षित स्थलांतर मार्ग दाखवा',
      closeBtn: 'योजना बंद करा',
    },
    citizenApp: {
      appTitle: 'SURGE नागरिक पोर्टल',
      appSubtitle: 'रस्त्यावरील पाणी साचणे इशारे, लाइव्ह जीपीएस सुरक्षित मार्ग व नोंदणी',
      tabGis: 'जीआयएस नकाशा व थर',
      tabAlerts: 'लाइव्ह आपत्कालीन इशारे',
      tabRoute: 'वाहन-सुरक्षित मार्ग',
      tabReport: 'पाण्याची नोंद करा',
      useLiveGps: 'माझे लाइव्ह जीपीएस स्थान वापरा',
      gpsAcquired: 'लाइव्ह जीपीएस स्थान मिळाले',
      gpsDenied: 'जीपीएस परवानगी नाकारली',
      locateMe: 'माझे स्थान शोधा',
      launchCitizenApp: 'सिटीझन ॲप उघडा',
      tabEmergency: 'तातडीचे संपर्क',
    },
    emergencyServices: {
      title: 'भारतीय आपत्कालीन हेल्पलाइन',
      subTitle: 'आपत्ती निवारण आणि वैद्यकीय मदतीसाठी १-टॅप टोल-फ्री संपर्क',
      callNow: 'कॉल करा',
      tollFree: '२४x७ टोल-फ्री',
      ndrfTitle: 'एनडीआरएफ आपत्ती प्रतिसाद नियंत्रण कक्ष',
      ndrfDesc: 'राष्ट्रीय आपत्ती प्रतिसाद दल (NDRF) पूर बचाव, नाव सुटका आणि अतिवृष्टी मदत कार्य.',
      national112Title: 'सर्व-भारतीय एकत्रित आपत्कालीन क्रमांक',
      national112Desc: 'सर्व भारतीय राज्ये आणि केंद्रशासित प्रदेशांसाठी एकच आपत्कालीन क्रमांक.',
      municipal1916Title: 'महानगरपालिका आपत्ती व्यवस्थापन कक्ष',
      municipal1916Desc: 'महानगरपालिका (BMC/NDMC/GCC) शहर पूर नियंत्रण, पाणी उपसा आणि वृक्ष पडझड मदत.',
      ambulance108Title: 'तातडीची वैद्यकीय आणि रुग्णवाहिका सेवा',
      ambulance108Desc: 'मोफत आपत्कालीन रुग्णवाहिका आणि पूर बाधित रुग्णांची सुटका.',
      fire101Title: 'अग्निशामक दल आणि पूर बचाव कार्य',
      fire101Desc: 'पाण्यात अडकलेली वाहने बाहेर काढणे आणि नागरिकांची सुटका करणे.',
      police100Title: 'पोलीस नियंत्रण कक्ष आणि वाहतूक पोलीस',
      police100Desc: 'वाहतूक वळवणे आणि रस्ते सुरक्षा नियंत्रण कार्य.',
      coastal1093Title: 'किनारपट्टी सुरक्षा आणि उधाणाची भरती गस्त',
      coastal1093Desc: 'भारतीय तटरक्षक दल सागरी सुरक्षा आणि भरती पूर मदत.',
    },
    voiceNav: {
      voiceGuide: 'व्हॉइस नेव्हिगेशन',
      speaking: 'ऑडिओ चालू आहे...',
      stopVoice: 'व्हॉइस थांबवा',
      inMeters: '{distance} मीटरमध्ये',
      turnLeft: 'डावीकडे वळा',
      turnRight: 'उजवीकडे वळा',
      proceedStraight: 'सरळ पुढे जा',
      hazardWarning: 'सावधान! पुढे पाण्यात बुडालेला सबवे आहे. पर्यायी मार्ग वापरा.',
      destinationArrived: 'तुम्ही तुमच्या सुरक्षित उंच आसरा केंद्रावर पोहोचला आहात.',
    },
    sidebar: {
      nowcastGis: 'जीआयएस पूर नकाशा',
      hydroRouting: 'हायड्रो रूटिंग',
      citizenSignals: 'नागरिक संकेत',
      adminModeration: 'तपासणी रांग',
      waterBodies: 'जलसाठा नकाशा',
      simulationReplay: 'सिम्युलेशन रीप्ले',
      authorityMode: 'प्राधिकरण मोड',
    },
    simulation: {
      title: 'रिअल-टाइम हायड्रोलिक पावसाचे पाणी सिम्युलेशन रीप्ले',
      subTitle: 'ऐतिहासिक पावसाच्या नोंदी आणि ड्रेनेज क्षमतेची चाचणी घ्या',
      benchmarkTitle: 'ऐतिहासिक नोंदी रीप्ले',
      selectScenario: 'पाऊस प्रकार निवडा',
      rainIntensity: 'पावसाची तीव्रता',
      solverTelemetry: 'हायड्रोलिक डेटा टेलिमेट्री',
      runReplay: 'सिम्युलेशन सुरू करा',
      pauseReplay: 'थांबवा',
      resetReplay: 'पुन्हा सुरू करा',
      historicalBenchmarks: 'ऐतिहासिक पाऊस नोंदी',
    },
    adminModeration: {
      portalBadge: 'महानगरपालिका कमांड व मॉडरेशन पोर्टल',
      title: 'ड्रेनेज तुंबणे व आपत्कालीन टीम नियंत्रण',
      subTitle: 'नागरिकांनी नोंदवलेल्या पाण्याचा फुगवटा व गटार तुंबण्याची तपासणी करा. अहवाल मंजूर केल्यास पूर मॉडेलमध्ये आपोआप क्षमता अपडेट होते.',
      syncQueue: 'रांग सिंक करा',
      pendingOperator: 'ऑपरेटर तपासणी प्रलंबित',
      awaitingTriage: 'तपासणीची प्रतीक्षा',
      crowdsourcedReports: 'नागरिक नोंदी',
      validatedBottlenecks: 'सत्यापित तुंबलेले भाग',
      activeHotspots: 'सक्रिय हॉटस्पॉट्स',
      flowVelocities: 'पाण्याचा प्रवाह वेगावर परिणाम',
      clogsCleared: 'गटारे साचणे दूर केले',
      fullyRestored: 'पूर्णपणे पूर्ववत',
      desiltingCompleted: 'गाळ काढणी काम पूर्ण',
      meshMultiplier: 'हायड्रोलिक मेष गुणांक',
      capacity: 'क्षमता',
      swmmCalibration: 'रिअल-टाइम SWMM कॅलिब्रेशन',
      triageStream: 'तपासणी व प्रेषण प्रवाह',
      pending: 'प्रलंबित',
      validated: 'सत्यापित',
      resolved: 'सोडवले',
      allReports: 'सर्व नोंदी',
      noReports: 'या श्रेणीत कोणत्याही नोंदी नाहीत. यंत्रणा सुरळीत सुरू आहे.',
      reporter: 'नोंदणीकर्ता',
      coordinates: 'अक्षंश-रेखांश',
      verifiedBy: 'द्वारे सत्यापित',
      verifyRestrict: 'सत्यापित करा व मर्यादा लावा',
      dispatchCrew: 'टीम पाठवा व दुरुस्त करा',
      clogCleared: 'अडथळा दूर झाला',
    },
    chatbot: {
      title: 'SURGE AI ऑपरेशन्स डेस्क',
      liveScada: 'लाइव्ह स्कॅडा व टेलिमेट्री एकत्रित',
      quotaLabel: 'कोटा',
      minimizeModal: 'लहान करा',
      expandModal: 'मोठे करा',
      clearHistory: 'संभाषण पुसा',
      closeModal: 'चॅट बंद करा',
      rateLimitActive: 'मर्यादा संपली. कोटा पुन्हा सुरू होईल:',
      suggestedQueries: 'सुचवलेले प्रश्न:',
      inputPlaceholder: 'रस्ता सुरक्षा, रडार, पूर याबद्दल विचारा...',
      sendBtn: 'पाठवा',
      vehicleSafetyCat: 'वाहन सुरक्षा',
      vehicleSafetyQuery: 'हॅचबॅक किंवा सेडान ३५ सेमी साचलेल्या पाण्यातून सुरक्षित जाऊ शकते का?',
      radarCat: 'रडार व अंदाज',
      radarQuery: 'SURGE डॉपलर रडारला १D गटार नेटवर्कशी कसे जोडतो?',
      evacuationCat: 'स्थलांतर',
      evacuationQuery: 'जवळचे उंच आपत्कालीन निवारा केंद्र कसे शोधावे?',
      scadaCat: 'स्कॅडा डेटा',
      scadaQuery: 'गटार ओव्हरफ्लो इशारे आणि भरती-ओहोटीच्या पातळ्यांचा अर्थ काय?',
    },
    citizenSignal: {
      groundTruthBadge: 'नागरिक वस्तुस्थिती स्तर',
      swmmModelFeedback: 'थेट SWMM मॉडेल फीडबॅक',
      title: 'गटार अडथळा व पाणी साचणे नोंदणी डेस्क',
      subTitle: 'तुंबलेली गटारे, ओव्हरफ्लो होणारे नाले व साचलेले पाणी यांची रिअल-टाइम नोंद करा. सत्यापित नोंदी ड्रेनेज क्षमतेची पुनर्रचना करतात.',
      cityCapacityFactor: 'शहर हायड्रोलिक क्षमता दर',
      activeHotspots: 'सक्रिय सत्यापित हॉटस्पॉट्स',
      submitHazardHeader: 'धोक्याची नोंद करा',
      locationSub: 'ठिकाण आपोआप जवळच्या महापालिका मॅनहोलशी जोडले जाते.',
      incidentLocation: 'घटना स्थान:',
      autoGps: 'ऑटो GPS',
      detecting: 'शोधत आहे...',
      nearestManhole: 'जवळचे ड्रेनेज मॅनहोल:',
      selectCategory: 'धोक्याचा प्रकार निवडा:',
      waterlogging: 'रस्त्यावर पाणी साचणे',
      blockedInlet: 'तुंबलेले मॅनहोल',
      drainOverflow: 'नाला ओव्हरफ्लो',
      sewerBackflow: 'गटार बॅकफ्लो',
      severityLabel: 'अंदाजित अडथळ्याची तीव्रता:',
      penalty: 'पेनल्टी',
      reportTitle: 'अहवाल शीर्षक:',
      titlePlaceholder: 'उदा. कचऱ्यामुळे गटार तुंबले आहे',
      notesLabel: 'अधिक माहिती:',
      notesPlaceholder: 'पाण्याची खोली, वाहतूक कोंडी याबद्दल सांगा...',
      attachPhoto: 'पुरावा फोटो जोडा:',
      clearPhoto: 'हटावा',
      sampleClogPhoto: 'नमूना अडथळा फोटो',
      sampleFloodPhoto: 'नमूना पूर फोटो',
      photoAttached: 'फोटो जोडला',
      reporterHandle: 'नाव / प्रभाग:',
      reporterPlaceholder: 'उदा. KurlaResident_WardL',
      submitBtn: 'माहिती सादर करा',
      liveStreamHeader: 'लाइव्ह नागरिक नोंदी प्रवाह',
      crowdObsSub: 'हायड्रोलॉजिस्टद्वारे सत्यापित रिअल-टाइम नोंदी.',
      statusLabel: 'स्थिती:',
      allReports: 'सर्व नोंदी',
      photoEvidence: 'छायाचित्र पुरावा',
      verifiedByBmc: 'महापालिकेने सत्यापित केले',
    },
    hydroRouting: {
      engineBadge: 'डायनॅमिक हायड्रो-रूटिंग इंजिन',
      scadaChainValidated: 'SHA-256 स्कॅडा साखळी सत्यापित',
      title: 'पावसाच्या पाण्याचे वळण व बफर मॅट्रिक्स',
      subTitle: 'साचलेले पाणी सांडपाणी प्रक्रिया प्रकल्प (STP), भूगर्भ पुनर्भरण विहिरी आणि तलावांकडे आपोआप वळवणे.',
      triggerAutoDiversion: 'ऑटो-डायव्हर्जन मॅट्रिक्स सुरू करा',
      executingDiversion: 'पाणी वळवले जात आहे...',
      syncBtn: 'सिंक',
      divertedVolume: 'वळवलेले पाण्याचे प्रमाण',
      activeBypassFlow: 'सक्रिय बायपास प्रवाह:',
      activeSluiceGates: 'सक्रिय फ्लड गेट्स',
      gatesOpen: 'उघडलेले गेट्स',
      scadaStatus: 'स्कॅडा स्थिती:',
      allResponding: 'सर्व कार्यरत',
      bufferHeadroom: 'उपलब्ध बफर क्षमता',
      storageRemaining: 'तलावांमधील उर्वरित साठा क्षमता',
      systemAuditLog: 'सिस्टम ऑडिट लॉग',
      tamperProof: 'सुरक्षित साखळी',
      sluiceRegistryTitle: 'महापालिका सिंक व गेट नोंदणी',
      infrastructureSub: 'अतिरिक्त पुराचे पाणी सामावून घेण्यास सक्षम अधिकृत पायाभूत सुविधा.',
      filterSink: 'फिल्टर करा:',
      allSinks: 'सर्व नोंदणीकृत सिंक',
      stpSinks: 'एसटीपी प्रकल्प',
      marSinks: 'भूगर्भ पुनर्भरण विहिरी',
      lakeSinks: 'शहरी तलाव',
      storageFill: 'सध्याचा पाणी साठा',
      intakeFlow: 'प्रवेश प्रवाह',
      sluiceGate: 'स्लूस गेट',
      adjustActuator: 'गेटची स्थिती बदला',
      scadaAuditLedger: 'स्कॅडा कामकाज ऑडिट वही',
      genesisToHead: 'प्रत्येक गेटचे उघडझाप सत्यापित करणारी सुरक्षित SHA-256 साखळी.',
      blocksVerified: 'ब्लॉक्स सत्यापित',
      blockIndex: 'ब्लॉक #',
      prevHash: 'मागील हॅश:',
      overrideModalTitle: 'स्कॅडा फ्लड गेट नियंत्रण',
      targetInfrastructure: 'लक्ष्य सिंक रचना:',
      gatePosition: 'गेट स्थिती:',
      openLabel: 'उघडे',
      closedLabel: 'बंद',
      operationalJustification: 'कारणांची नोंद (ऑन-चेन नोंदणी):',
      auditLogNotice: 'हा बदल SHA-256 सह हॅश केला जाईल व लेजरमध्ये नोंदवला जाईल.',
      cancelBtn: 'रद्द करा',
      signDispatchBtn: 'स्वाक्षरी करा व लागू करा',
    },
    nowcast: {
      title: 'एआय पूर पूर्वसूचना',
      deepseekBadge: 'Qwen 2.5 3B',
      fallbackBadge: 'फॉलबॅक',
      predicting: 'अंदाज घेत आहे...',
      refreshBtn: 'रिफ्रेश',
      runPredictionBtn: 'अंदाज सुरू करा',
      emptyStatePrompt: 'रडार व हवामान डेटाचा वापर करून एआय पूर अंदाज मिळवण्यासाठी बटण दाबा.',
      reasoningSensorData: 'सेंसर डेटावर एआय विश्लेषण सुरू आहे...',
      riskSuffix: 'धोका',
      confidenceSuffix: 'अचूकता',
      outlookHeading: 'पूर्वावलोकन',
      nowLabel: 'आत्ता',
      keyRisksHeading: 'मुख्य धोके',
      recommendationHeading: 'सल्ला',
      aiReasoningHeading: 'एआय युक्तिवाद',
      sensorInputsHeading: 'सेंसर इनपुट',
    },
    precipitationBadge: {
      liveRadar: 'लाइव्ह रडार',
      modelEstimate: 'मॉडेल अंदाज (फॉलबॅक)',
      noData: 'रडार डेटा उपलब्ध नाही',
      lastUpdated: 'अंतिम अपडेट',
      decodeConfidence: 'अचूकता दर',
      stationCode: 'स्टेशन कोड',
      freshness: 'ताजेपणा',
      freshLabel: 'ताजे (१० मिनिटांच्या आत)',
      staleLabel: 'जुने',
      source: 'स्रोत:',
    },
    waterAtlas: {
      atlasBadge: 'जलसाठा व जलपरीवाह नकाशा',
      coastalSyncBadge: 'किनारपट्टी गेट सिंक',
      title: 'शहरी तलाव व भरती-ओहोटी नियंत्रण',
      subTitle: 'शहरी तलावांमधील पाणी पातळी, अतिक्रमण व उधाणाच्या भरतीनुसार स्वयंचलित दरवाजे.',
      highTidePeak: 'उधाणाची भरती (मुंबई पोर्ट)',
      flapGateLockout: 'गेट लॉकआउट:',
      preventsBackflow: 'समुद्राचे पाणी शहरात येण्यापासून रोखते',
      urbanReservoirsHeading: 'शहरी जलसाठा व तलाव क्षमता',
      totalBufferHeadroom: 'एकूण पूर बफर क्षमता:',
      FTL: 'पूर्ण तलाव पातळी (FTL)',
      storage: 'पाणी साठा',
      cushion: 'उर्वरित जागा',
      encroachment: 'अतिक्रमण:',
      priority: 'प्राधान्य:',
      coastalOutfallsHeading: 'समुद्र किनारा आउटफॉल व बॅकफ्लो नियंत्रण',
      tidalFlapSub: 'उधाणाच्या भरतीच्या वेळी समुद्राचे पाणी रस्त्यावर येऊ नये म्हणून दरवाजे आपोआप बंद होतात.',
      dischargeRate: 'विसर्ग दर',
      seaInvertHead: 'समुद्र पातळी हेड',
    },
    splash: {
      loadingLabel: 'SURGE प्लॅटफॉर्म लोड होत आहे',
      title: 'SURGE',
      subtitle: 'नागरी पूर अंदाज प्रणाली',
    },
    simulationTutorial: {
      bannerTitle: 'सिम्युलेशन सुरक्षा बॅनर',
      bannerText: 'नेहमी वरील सुरक्षा बॅनर तपासा - हे वातावरण ऐतिहासिक पुराच्या नोंदींचे रीप्ले आहे.',
      selectorTitle: 'शहर व घटना निवड',
      selectorText: 'मुंबई, दिल्ली, चेन्नई दरम्यान बदला व ९ ऐतिहासिक पाऊस नोंदींमधून निवडा.',
      controlsTitle: 'टाइमलाइन रीप्ले नियंत्रणे',
      controlsText: 'प्ले/पॉज व स्पीड बटणे वापरून पुराचा अंदाज पुन्हा पहा.',
      provenanceTitle: 'डेटा स्रोत व एआय विश्लेषण',
      provenanceText: 'हवामान अंदाज नोंदी व एआय विश्लेषणाची टप्प्याटप्प्याने पडताळणी करा.',
      mapTitle: 'हायड्रोलिक जीआयएस नकाशा',
      mapText: 'नकाशावर साचलेल्या पाण्याचा अंदाज व महत्त्वाचे धोकादायक भाग पहा.',
      nextBtn: 'पुढे',
      finishBtn: 'पूर्ण करा',
      skipBtn: 'रद्द करा',
      stepOf: 'टप्पा',
    },
    common: {
      panelTab: 'पॅनेल',
      gisMapTab: 'जीआयएस नकाशा',
      loadingGis: 'जीआयएस नकाशा लोड होत आहे...',
      loadingCitizenApp: 'सिटीझन ॲप लोड होत आहे...',
      loadingOperationsHub: 'ऑपरेशन्स हब लोड होत आहे...',
    },
  },

  ta: {
    nav: {
      brand: 'SURGE',
      subTitle: 'நகர்ப்புற வெள்ள முன்னறிவிப்பு போர்ட்டல்',
      backToLanding: 'முகப்புப் பக்கத்திற்குச் செல்',
      openMeteoApi: 'Open-Meteo API',
      liveWeather: 'நேரலை வானிலை',
      maxDepth: 'அதிகபட்ச ஆழம்',
      reportWater: 'வெள்ளத்தைப் புகாரளிக்கவும்',
      authorityCenter: 'அதிகாரப்பூர்வ கட்டுப்பாட்டு மையம்',
      authorityPortal: 'அதிகாரப்பூர்வ போர்டல்',
      selectCity: 'நகரத்தைத் தேர்ந்தெடுக்கவும்',
      selectEvent: 'மழை சூழ்நிலையைத் தேர்ந்தெடுக்கவும்',
      lakes7: '7 ஏரிகள்: 87%',
      reservoirs5: '5 நீர்த்தேக்கங்கள்: 82%',
      yamunaStage: 'யமுனை மட்டம்: 204.8m',
    },
    landing: {
      fullForm: 'உள்ளூர் கண்காணிப்பு மற்றும் தலையீட்டிற்கான மழைப்பொழிவு மற்றும் வெள்ள அபாயக் கணிப்பு அமைப்பு',
      citizenDashboardBtn: 'குடிமக்கள் டாஷ்போர்டு',
      leadTimeBadge: '0–3 மணிநேர முன் கணிப்பு காலம்',
      heroTitle: 'தரைமட்ட மற்றும் நிலத்தடி ஒருங்கிணைந்த வெள்ள நுண்ணறிவு',
      heroSubtitle: 'தெரு அளவிலான நீரின் ஆழம், பாதாள சாக்கடை வழிதல் மற்றும் வெள்ளமில்லா பாதுகாப்பான வழிகளை உடனுக்குடன் கணிக்கவும்.',
      metricLeadTime: '0–3 மணி',
      metricHydraulics: '1D + 2D',
      metricPrecision: 'தெரு-அளவு',
      metricDetours: '100%',
      metricLeadTimeSub: 'முன்னறிவிப்பு காலம்',
      metricHydraulicsSub: 'ஒருங்கிணைந்த ஹைட்ராலிக்ஸ்',
      metricPrecisionSub: 'ஆழத் துல்லியம் (செ.மீ)',
      metricDetoursSub: 'பாதுகாப்பான மாற்று வழிகள்',
      selectCityTitle: 'நகர கட்டுப்பாட்டு மையத்தைத் தேர்ந்தெடுக்கவும்',
      selectCitySub: 'GIS வெள்ள டாஷ்போர்டைத் திறக்க கீழே உள்ள நகரத்தைத் தேர்ந்தெடுக்கவும்',
      liveRadar: 'நேரலை ரேடார்',
      highRiskHotspots: 'அதிக ஆபத்துள்ள பகுதிகள்:',
      authorityLoginDomain: 'அதிகாரப்பூர்வ உள்நுழைவு:',
      launchDashboard: 'டாஷ்போர்டைத் திற',
      authorityLoginBtn: 'அதிகாரப்பூர்வ உள்நுழைவு',
      simTitle: 'மழைநீர்வழிந்தோடல் சிமுலேட்டர் முன்னோட்டம்',
      simSub: 'தெரு வெள்ளத்தை கணிக்க மழையின் அளவை மாற்றவும்',
      simRainRate: 'மழை அளவு:',
      moderate: 'மிதமான (15 மிமீ/மணி)',
      heavy: 'கனமழை (45 மிமீ/மணி)',
      cloudburst: 'மேகவெடிப்பு (85 மிமீ/மணி)',
      predictedDepth: 'கணிக்கப்பட்ட நீரின் ஆழம்:',
      underpassLocation: 'தாழ்வான சுரங்கப்பாதையில்',
      capacityExceeded: 'வடிகால் கொள்ளளவு தாண்டப்பட்டது (>100%). தெருவில் நீர் வழிதல்.',
      capacityAdequate: 'வடிகால் கொள்ளளவு போதுமானது.',
      faqTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      faqBadge: 'முக்கிய வினாக்கள்',
      faqMainHeading: 'SURGE பற்றி நீங்கள் தெரிந்து கொள்ள வேண்டியவை',
      footerTitle: 'SURGE • நகர்ப்புற வெள்ள முன்னறிவிப்பு அமைப்பு',
      footerSub: 'புவி அறிவியல் அமைச்சகம் (MoES) • தேசிய நடுத்தர வரம்பு வானிலை முன்னறிவிப்பு மையம் (NCMRWF)',
      feature1Title: 'ஒருங்கிணைந்த 1D + 2D ஹைட்ராலிக்ஸ்',
      feature1Sub: 'ரேடார் தரவு, 2D தரைமட்ட நீர் மற்றும் 1D நிலத்தடி வடிகால் வலையமைப்பை இணைக்கிறது.',
      feature2Title: 'பாதுகாப்பான வழித்தட API',
      feature2Sub: 'வெள்ளத்தில் மூழ்கிய பாதைகளைத் தவிர்த்து வாகனங்களைப் பாதுகாப்பான மாற்று வழிகளில் திருப்புகிறது.',
      feature3Title: 'அதிகாரப்பூர்வ SitRep ஏற்றுமதி',
      feature3Sub: 'பேரிடர் மேலாண்மைக் குழுக்களுக்கு மோட்டார் கட்டுப்பாடுகள் மற்றும் அறிக்கை பதிவிறக்க வசதி வழங்குகிறது.',
    },
    faqs: [
      {
        q: 'அதிகாரிகள் உள்நுழைய என்ன சான்றுகளைப் பயன்படுத்துகிறார்கள்?',
        a: 'அதிகாரிகள் தங்கள் அதிகாரப்பூர்வ நகர டொமைன் (எ.கா. chennai.aqua.gov.in) மற்றும் கடவுச்சொல்: 12345678 பயன்படுத்தி உள்நுழைகிறார்கள்.'
      },
      {
        q: 'SURGE 0–3 மணி நேரத்திற்கு முன்பே வெள்ளத்தை எவ்வாறு கணிக்கிறது?',
        a: 'SURGE நேரலை ரேடார் தரவு, 2D நிலப்பரப்பு மாதிரி மற்றும் 1D நிலத்தடி வடிகால் வலையமைப்பை இணைத்து துல்லியமாக கணிக்கிறது.'
      },
      {
        q: 'எந்த இந்திய நகரங்கள் தற்சமயம் சேர்க்கப்பட்டுள்ளன?',
        a: 'மும்பை, டெல்லி மற்றும் சென்னை (வேளச்சேரி, தி. நகர், சைதாப்பேட்டை).'
      },
      {
        q: 'பாதுகாப்பான வழித்தட அமைப்பு எவ்வாறு செயல்படுகிறது?',
        a: 'நீரின் ஆழத்திற்கு ஏற்ப வாகனங்களை பாதுகாப்பான மாற்று வழிகளில் திசைமாற்றுகிறது.'
      },
      {
        q: 'பொதுமக்கள் எவ்வாறு தகவல்களைப் பகிரலாம்?',
        a: '"வெள்ளத்தைப் புகாரளிக்கவும்" பொத்தானைக் கிளிக் செய்து தகவல்களை அனுப்பலாம்.'
      }
    ],
    routing: {
      title: 'வெள்ளமில்லா அவசர வழித் திட்டமிடுபவர்',
      subTitle: 'நேரலை வெள்ள முன்னறிவிப்பின் அடிப்படையில் பாதுகாப்பான வழியைக் கணக்கிடுகிறது',
      originPlaceholder: 'தொடக்க இடம் / தற்போதைய GPS',
      destPlaceholder: 'செல்ல வேண்டிய இடம் / மருத்துவமனை / முகாம்',
      pickOrigin: 'வரைபடத்தில் தேர்வு செய்க',
      pickDest: 'செல்லுமிடத்தைத் தேர்வு செய்க',
      pinned: 'வரைபடத்தில் குறிக்கப்பட்டது',
      carSedan: 'கார் / செடான்',
      ambulance: 'ஆம்புலன்ஸ் (அவசரம்)',
      autoBike: 'ஆட்டோ / பைக்',
      pedestrian: 'நடைபயணம் (நடந்து)',
      findRoute: 'பாதுகாப்பான வழியைக் கண்டுபிடி',
      calculating: 'வழியைக் கணக்கிடுகிறது...',
      distance: 'தூரம்',
      eta: 'எதிர்பார்க்கப்படும் நேரம்',
      riskScore: 'வழித்தட ஆபத்து',
      riskSafe: 'பாதுகாப்பான வழி (0-10 செ.மீ)',
      riskModerate: 'மிதமான வெள்ளம் (10-25 செ.மீ)',
      riskHigh: 'அதிக ஆபத்து (25-45 செ.மீ)',
      riskImpassable: 'செல்ல முடியாதது (>45 செ.மீ)',
      turnByTurn: 'பாதுகாப்பான வழி வழிகாட்டல்',
      noRouteFound: 'பாதுகாப்பான வழி எதுவும் கிடைக்கவில்லை. வேறு இடத்தைத் தேர்ந்தெடுக்கவும்.',
      pickLocationPrompt: 'இடத்தைத் தேர்ந்தெடுக்க வரைபடத்தில் கிளிக் செய்யவும்',
      clearRoute: 'வழியை நீக்கு',
      vehicleProfileClearance: 'வாகன சுயவிவரம் மற்றும் அனுமதி வரம்பு:',
      maxSafe: 'அதிகபட்ச பாதுகாப்பானது:',
      hatchback: 'ஹேட்ச்பேக்',
      suv: 'எஸ்.யு.வி 4x4',
      bus: 'பேருந்து / கனரக வாகனம்',
      realRoadSafeRoute: 'SURGE நிஜ சாலை வெள்ளமில்லா பாதுகாப்பான வழி',
      noSafeRouteFor: 'பாதுகாப்பான வழி இல்லை:',
      selectHazardZone: 'வெள்ள அபாயப் பகுதியைத் தேர்ந்தெடுக்கவும்:',
      nearestShelter: 'அருகிலுள்ள பாதுகாப்பான நிவாரண முகாம்',
      rescueVehicleRoute: 'மீட்பு வாகன வழி',
    },
    alerts: {
      title: 'நேரலை ஆபத்து எச்சரிக்கைகள்',
      subTitle: 'வெள்ளம் மற்றும் வடிகால் வழிதல் பற்றிய உடனடி அறிவிப்புகள்',
      tabAll: 'எல்லா எச்சரிக்கைகளும்',
      tabInundation: 'தெரு வெள்ளம்',
      tabSurcharge: 'சாக்கடை வழிதல்',
      tabReports: 'பொதுமக்கள் புகார்கள்',
      critical: 'மிகவும் ஆபத்தானது',
      warning: 'எச்சரிக்கை',
      advisory: 'ஆலோசனை',
      helplineTitle: 'அவசரகால உதவி எண்கள்',
      ndrfHelpline: 'NDRF கட்டுப்பாட்டு அறை',
      controlRoom: 'மாநகராட்சி கட்டுப்பாட்டு அறை',
      disasterLine: 'பேரிடர் உதவி எண்',
      reportedAgo: 'நிமிடங்களுக்கு முன்',
      verified: 'சரிபார்க்கப்பட்டது',
      unverified: 'சரிபார்க்கப்படாதது',
      borough: 'பகுதி / மண்டலம்',
      elevation: 'உயரம்',
      overcapacity: 'கொள்ளளவை விட அதிகம்',
      surfaceSpill: 'தரைமட்ட நீர் வழிதல்',
      hydraulicBackflow: 'வடிகால் பின்னோக்கிய நீர் பாய்வு',
      noAlerts: 'இந்த நேரத்தில் கடுமையான வெள்ளப் பெருக்கு கணிப்பு இல்லை.',
    },
    slider: {
      title: '0–3 மணிநேர வெள்ள முன்னறிவிப்பு காலக்கோடு',
      subTitle: 'வெள்ளத்தை முன்கூட்டியே பார்க்க காலக்கோட்டை நகர்த்தவும்',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'தற்போதைய நேரம்',
      nowLive: 'இப்போது (நேரலை)',
      plusMin: 'நிமி',
      plusHour: 'மணி',
      rainRateLabel: 'மழை வேகம்:',
      forecastDepthLabel: 'அதிகபட்ச ஆழம்:',
    },
    reportModal: {
      title: 'நீர் ஆழத்தைப் புகாரளிக்கவும்',
      subTitle: 'கட்டுப்பாட்டு மையத்திற்கு உண்மைத் தகவலை வழங்கி உதவுங்கள்',
      locationLabel: 'இடம் / அடையாளம்',
      depthLabel: 'நீரின் ஆழம் (செ.மீ)',
      photoLabel: 'புகைப்படம் பதிவேற்றவும் (விருப்பத்தேர்வு)',
      photoNote: 'வெள்ள புகைப்படத்தை பதிவேற்றவும்',
      obsLabel: 'கூடுதல் விவரங்கள்',
      obsPlaceholder: 'சிக்கிய வாகனங்கள், அடைபட்ட வடிகால்கள் பற்றி குறிப்பிடவும்...',
      helpCheck: 'உடனடி அவசர உதவி தேவை',
      submitBtn: 'புகாரைச் சமர்ப்பிக்கவும்',
      submitting: 'சமர்ப்பிக்கிறது...',
      cancelBtn: 'ரத்து செய்',
      successToast: 'புகார் கட்டுப்பாட்டு மையத்திற்கு வெற்றிகரமாக அனுப்பப்பட்டது!',
    },
    authModal: {
      title: 'பேரிடர் மேலாண்மை அதிகாரி உள்நுழைவு',
      subTitle: 'நிலத்தடி வடிகால் தரவு மற்றும் பம்ப் கட்டுப்பாடுகளை அணுகவும்',
      domainLabel: 'அதிகாரப்பூர்வ டொமைன் / ID',
      domainPlaceholder: 'எ.கா. chennai.aqua.gov.in',
      passcodeLabel: 'கடவுச்சொல்',
      passcodePlaceholder: '8 இலக்க கடவுச்சொல்லை உள்ளிடவும்',
      loginBtn: 'உள்நுழைக',
      loggingIn: 'சரிபார்க்கிறது...',
      demoNote: 'மாதிரி கடவுச்சொல்:',
      invalidCredentials: 'தவறான கடவுச்சொல். 12345678 என்ற கடவுச்சொல்லைப் பயன்படுத்தவும்.',
    },
    dashboard: {
      title: 'பேரிடர் மேலாண்மை கட்டுப்பாட்டு மையம்',
      subTitle: 'நேரலை நகராட்சி வெள்ளத் தரவு மற்றும் பம்ப் மேலாண்மை',
      officerBadge: 'செயலில் உள்ள அதிகாரி:',
      totalSubmerged: 'மூழ்கிய சாலைகள்',
      surchargingPipes: 'வழியும் சாக்கடைகள்',
      pumpsActive: 'இயங்கும் மோட்டார்கள்',
      exportSitRep: 'SitRep அறிக்கையைப் பதிவிறக்கு',
      pumpControllerTitle: 'நீரேற்று நிலைய செயல்பாடுகள்',
      pumpStatus: 'மோட்டார் நிலை',
      activatePump: 'மோட்டாரை இயக்கு (1500 L/s)',
      deactivatePump: 'காத்திருப்பு நிலை',
      groundTruthTitle: 'பொதுமக்கள் புகார்கள் சரிபார்ப்பு',
      verifyBtn: 'சரிபார் & நடவடிக்கை எடு',
      dismissBtn: 'நிராகரி',
      statusPending: 'நிலுவையில் உள்ளது',
      statusVerified: 'சரிபார்க்கப்பட்டது',
      statusDismissed: 'நிராகரிக்கப்பட்டது',
      evacRouteBtn: 'வெளியேற்ற திட்டத்தை உருவாக்கு',
    },
    sitrep: {
      title: 'சூழ்நிலை அறிக்கை (SitRep) ஏற்றுமதியாளர்',
      subTitle: 'உயரதிகாரிகளுக்கான அதிகாரப்பூர்வ வெள்ள நிலை அறிக்கை',
      generatePdf: 'SitRep PDF பதிவிறக்கு',
      downloadCsv: 'CSV தரவை ஏற்றுமதி செய்',
      downloadJson: 'JSON தரவை ஏற்றுமதி செய்',
      generating: 'அறிக்கை தயாராகிறது...',
      summaryHeading: 'வெள்ள நிலைமை சுருக்கம்',
      criticalZones: 'முக்கிய ஆபத்தான பகுதிகள்:',
    },
    tide: {
      title: 'அலை மற்றும் நீர்நிலை தரவு',
      highTideCountdown: 'அடுத்த கடல் அலை நேரம்:',
      nextHighTide: 'அலையின் உயரம்:',
      seaLevel: 'கடல் நீர் மட்டம்:',
      reservoirStorage: 'நீர்த்தேக்க அளவு:',
      lakesRunway: 'குடிநீர் விநியோக நாட்கள்:',
    },
    drainage: {
      title: 'நிலத்தடி வடிகால் வலையமைப்பு',
      undergroundGraph: '1D நிலத்தடி வடிகால்',
      coupledSurface: 'தரைமட்ட நீர்',
      pipeDischarge: 'அதிகபட்ச வெளியேற்ற வேகம்',
      capacityUsage: 'கொள்ளளவு பயன்பாடு',
      criticalNodes: 'வழியும் சாக்கடைகள்',
    },
    map: {
      layers: 'வரைபட அடுக்குகள்',
      basemapVector: 'சாலை வரைபடம்',
      basemapSat: 'செயற்கைக்கோள் வரைபடம்',
      inundationMesh: 'நீரின் ஆழம்',
      pipeGraph: 'வடிகால் வலையமைப்பு',
      citizenReports: 'பொதுமக்கள் புகார்கள்',
      legendTitle: 'நீர் ஆழக் குறியீடு',
      depthSafe: '< 10 செ.மீ (பாதுகாப்பானது)',
      depthModerate: '10 – 25 செ.மீ (கவனம்)',
      depthHigh: '25 – 45 செ.மீ (அதிக ஆபத்து)',
      depthSevere: '> 45 செ.மீ (செல்ல முடியாது)',
      surchargingNode: 'சாக்கடை வழிதல்',
      safeRoute: 'பாதுகாப்பான மாற்று வழி',
      popupRoad: 'சாலை:',
      popupDepth: 'கணிக்கப்பட்ட ஆழம்:',
      popupStatus: 'நிலை:',
      popupPassable: 'வாகனங்கள் செல்லலாம்',
      popupImpassable: 'வெள்ளம் - தவிர்க்கவும்',
    },
    evacuationModal: {
      title: 'அவசரகால வெளியேற்ற வழிகாட்டுதல் திட்டம்',
      subTitle: 'உங்கள் வாகனத்தின் திறன் அடிப்படையில் படி-படியாக பாதுகாப்பான வழி',
      selectVehicle: 'உங்கள் வாகன வகையைத் தேர்ந்தெடுக்கவும்:',
      hazardZone: 'செயலில் உள்ள வெள்ள அபாயப் பகுதி',
      shelterHeading: 'அருகிலுள்ள பாதுகாப்பான நிவாரண முகாம்',
      elevationGain: 'உயர அதிகரிப்பு',
      stepByStepHeading: 'படி-படியான வெளியேற்றப் பாதை திட்டம்',
      step1Title: 'படி 1: உடனடி தயாரிப்பு & நீர் மட்டப் பரிசோதனை',
      step2Title: 'படி 2: மூழ்கிய பாதைகளைத் தவிர்க்கும் அறிவுறுத்தல்',
      step3Title: 'படி 3: திருப்பத்திற்குத் திருப்பமான பாதுகாப்பான வழி',
      step4Title: 'படி 4: நிவாரண முகாம் வருகை & உதவிப் பதிவு',
      deployMapBtn: 'வரைபடத்தில் பாதுகாப்பான வழியைக் காட்டு',
      closeBtn: 'திட்டத்தை மூடு',
    },
    citizenApp: {
      appTitle: 'SURGE பொதுமக்கள் போர்ட்டல்',
      appSubtitle: 'தெரு வெள்ள எச்சரிக்கைகள், நேரலை GPS பாதுகாப்பான வழித்தடம் & புகார் பதிவு',
      tabGis: 'ஜிஐஎஸ் வரைபடம் & அடுக்குகள்',
      tabAlerts: 'நேரலை ஆபத்து எச்சரிக்கைகள்',
      tabRoute: 'பாதுகாப்பான வழித்தடம்',
      tabReport: 'வெள்ளத்தைப் புகாரளிக்கவும்',
      useLiveGps: 'எனது நேரலை GPS இடத்தைப் பயன்படுத்து',
      gpsAcquired: 'நேரலை GPS இடம் பெறப்பட்டது',
      gpsDenied: 'GPS அனுமதி மறுக்கப்பட்டது',
      locateMe: 'என் இடத்தை கண்டறி',
      launchCitizenApp: 'குடிமகன் செயலியைத் திற',
      tabEmergency: 'அவசர தொடர்புகள்',
    },
    emergencyServices: {
      title: 'இந்திய அவசர உதவி எண்கள்',
      subTitle: 'பேரிடர் மீட்பு & மருத்துவ உதவிக்கான 1-டேப் கட்டணமில்லா நேரடி எண்கள்',
      callNow: 'அழைக்கவும்',
      tollFree: '24x7 கட்டணமில்லா எண்',
      ndrfTitle: 'NDRF பேரிடர் மீட்புக் கட்டுப்பாட்டு அறை',
      ndrfDesc: 'தேசிய பேரிடர் மீட்புப் படை (NDRF) வெள்ள மீட்பு மற்றும் படகு வெளியேற்றப் பணிகள்.',
      national112Title: 'அகில இந்திய ஒருங்கிணைந்த அவசர எண்',
      national112Desc: 'அனைத்து இந்திய மாநிலங்களுக்கும் ஒன்றியப் பிரதேசங்களுக்கும் ஒரே அவசர உதவி எண்.',
      municipal1916Title: 'மாநகராட்சி பேரிடர் மேலாண்மைக் கட்டுப்பாட்டு அறை',
      municipal1916Desc: 'மாநகராட்சி (BMC/NDMC/GCC) நகர்ப்புற வெள்ள உதவி மையம் மற்றும் நீர் இறைக்கும் பம்புகள்.',
      ambulance108Title: 'அவசர மருத்துவ & ஆம்புலன்ஸ் சேவை',
      ambulance108Desc: 'இலவச அவசர மருத்துவ ஆம்புலன்ஸ் மற்றும் வெள்ள மீட்பு நோயாளி போக்குவரத்து.',
      fire101Title: 'தீயணைப்பு & வெள்ள மீட்புப் படை',
      fire101Desc: 'நீரில் மூழ்கிய சுரங்கப்பாதை வாகன மீட்பு மற்றும் வெள்ளத்தில் சிக்கியோரை மீட்கும் பணி.',
      police100Title: 'காவல் கட்டுப்பாட்டு அறை & போக்குவரத்து காவல்',
      police100Desc: 'அவசர சட்ட ஒழுங்கு பாதுகாப்பு மற்றும் வெள்ளப் பாதைகளில் போக்குவரத்து மாற்றம்.',
      coastal1093Title: 'கடலோரப் பாதுகாப்பு & கடலலை ரோந்து',
      coastal1093Desc: 'இந்திய கடலோரக் காவல் படை வெள்ள எச்சரிக்கை மற்றும் கடற்கரை அவசர உதவி.',
    },
    voiceNav: {
      voiceGuide: 'குரல் வழிசெலுத்தல்',
      speaking: 'ஒலி இயங்குகிறது...',
      stopVoice: 'குரலை நிறுத்து',
      inMeters: '{distance} மீட்டரில்',
      turnLeft: 'இடதுபுறம் திரும்பவும்',
      turnRight: 'வலதுபுறம் திரும்பவும்',
      proceedStraight: 'நேராகச் செல்லவும்',
      hazardWarning: 'எச்சரிக்கை! முன்னால் நீரில் மூழ்கிய சுரங்கப்பாதை உள்ளது. மாற்றுப் பாதையைப் பயன்படுத்தவும்.',
      destinationArrived: 'நீங்கள் பாதுகாப்பான உயர் நில தங்குமிடத்திற்கு வந்து சேர்ந்தீர்கள்.',
    },
    sidebar: {
      nowcastGis: 'GIS வெள்ள வரைபடம்',
      hydroRouting: 'ஹைட்ரோ வழிகாட்டி',
      citizenSignals: 'பொதுமக்கள் சமிக்ஞைகள்',
      adminModeration: 'சரிபார்ப்பு வரிசை',
      waterBodies: 'நீர்நிலைகள் வரைபடம்',
      simulationReplay: 'சிமுலேஷன் ரீப்ளே',
      authorityMode: 'அதிகாரப்பூர்வ முறை',
    },
    simulation: {
      title: 'நேரலை ஹைட்ராலிக் வெள்ள சிமுலேஷன் ரீப்ளே',
      subTitle: 'வரலாற்று மழை வெள்ள பதிவுகள் மற்றும் வடிகால் கொள்ளளவைச் சோதிக்கவும்',
      benchmarkTitle: 'வரலாற்றுப் பதிவு சிமுலேஷன்கள்',
      selectScenario: 'மழை சூழ்நிலையைத் தேர்ந்தெடுக்கவும்',
      rainIntensity: 'மழையின் வேகம்',
      solverTelemetry: 'ஹைட்ராலிக் தரவுத் தகவல்கள்',
      runReplay: 'சிமுலேஷனை இயக்கு',
      pauseReplay: 'நிறுத்து',
      resetReplay: 'மீட்டமைக்கவும்',
      historicalBenchmarks: 'வரலாற்று மழைப் பதிவுகள்',
    },
    adminModeration: {
      portalBadge: 'நகராட்சி கட்டுப்பாட்டு போர்டல்',
      title: 'வடிகால் அடைப்பு மற்றும் மீட்புக் குழு பணிமையம்',
      subTitle: 'பொதுமக்கள் புகாரளித்த அடைப்புகளைச் சரிபார்க்கவும். ஒப்புதல் அளித்தால் வெள்ள மாதிரியில் தானாகவே கொள்ளளவு புதுப்பிக்கப்படும்.',
      syncQueue: 'வரிசையைப் புதுப்பி',
      pendingOperator: 'அதிகாரி சரிபார்ப்பு நிலுவையில்',
      awaitingTriage: 'சரிபார்ப்பிற்கு காத்திருக்கிறது',
      crowdsourcedReports: 'பொதுமக்கள் புகார்கள்',
      validatedBottlenecks: 'உறுதிசெய்யப்பட்ட அடைப்புகள்',
      activeHotspots: 'செயலில் உள்ள பகுதிகள்',
      flowVelocities: 'நீர் ஓட்ட வேகத்தைப் பாதிக்கிறது',
      clogsCleared: 'அடைப்புகள் நீக்கப்பட்டன',
      fullyRestored: 'முழுமையாக சீரமைக்கப்பட்டது',
      desiltingCompleted: 'தூர்வாரும் பணி நிறைவடைந்தது',
      meshMultiplier: 'ஹைட்ராலிக் கொள்ளளவு காரணி',
      capacity: 'கொள்ளளவு',
      swmmCalibration: 'நேரலை SWMM அளவீடு',
      triageStream: 'சரிபார்ப்பு வரிசை',
      pending: 'நிலுவையில்',
      validated: 'உறுதி செய்யப்பட்டது',
      resolved: 'தீர்க்கப்பட்டது',
      allReports: 'அனைத்து புகார்கள்',
      noReports: 'இந்தப் பிரிவில் புகார்கள் இல்லை. அமைப்பு சீராக இயங்குகிறது.',
      reporter: 'புகாரளித்தவர்',
      coordinates: 'ஆயத்தொலைவுகள்',
      verifiedBy: 'சரிபார்த்தவர்',
      verifyRestrict: 'உறுதிசெய் & கட்டுப்படுத்து',
      dispatchCrew: 'குழுவை அனுப்பு & சீரமை',
      clogCleared: 'அடைப்பு நீக்கப்பட்டது',
    },
    chatbot: {
      title: 'SURGE AI உதவி மையம்',
      liveScada: 'நேரலை SCADA & தரவு இணைக்கப்பட்டது',
      quotaLabel: 'அளவு',
      minimizeModal: 'சுருக்கு',
      expandModal: 'பெரிதாக்கு',
      clearHistory: 'வரலாற்றை அழி',
      closeModal: 'உரையாடலை மூடு',
      rateLimitActive: 'எல்லை முடிந்தது. நேரம்:',
      suggestedQueries: 'பரிந்துரைக்கப்பட்ட கேள்விகள்:',
      inputPlaceholder: 'சாலை பாதுகாப்பு, ரேடார், வெள்ளம் பற்றி கேட்கவும்...',
      sendBtn: 'அனுப்பு',
      vehicleSafetyCat: 'வாகன பாதுகாப்பு',
      vehicleSafetyQuery: '35 செ.மீ வெள்ள நீரில் ஹேட்ச்பேக் அல்லது செடான் வாகனம் பாதுகாப்பாக செல்லுமா?',
      radarCat: 'ரேடார் & முன்னறிவிப்பு',
      radarQuery: 'SURGE ரேடார் தரவை வடிகால் வலையமைப்புடன் எவ்வாறு இணைக்கிறது?',
      evacuationCat: 'வெளியேற்றம்',
      evacuationQuery: 'அருகிலுள்ள வெள்ள நிவாரண முகாமைக் கண்டறிவது எப்படி?',
      scadaCat: 'SCADA தரவு',
      scadaQuery: 'நேரலை எச்சரிக்கைகள் மற்றும் அலை மட்டங்களின் பொருள் என்ன?',
    },
    citizenSignal: {
      groundTruthBadge: 'பொதுமக்கள் நேரலைத் தரவு',
      swmmModelFeedback: 'நேரடி SWMM மாதிரி கருத்து',
      title: 'வடிகால் அடைப்பு & வெள்ளப் பதிவு மையம்',
      subTitle: 'அடைபட்ட சாக்கடைகள் மற்றும் தேங்கிய நீரை உடனுக்குடன் புகாரளிக்கவும். சரிபார்க்கப்பட்ட தகவல்கள் வடிகால் கொள்ளளவை புதுப்பிக்கும்.',
      cityCapacityFactor: 'நகர ஹைட்ராலிக் கொள்ளளவு காரணி',
      activeHotspots: 'செயலில் உள்ள பகுதிகள்',
      submitHazardHeader: 'ஆபத்து பதிவைச் சமர்ப்பிக்கவும்',
      locationSub: 'இருப்பிடம் அருகிலுள்ள நகராட்சி சாக்கடையுடன் தானாக இணைக்கப்படுகிறது.',
      incidentLocation: 'சம்பவ இடம்:',
      autoGps: 'தானியங்கி GPS',
      detecting: 'கண்டறிகிறது...',
      nearestManhole: 'அருகிலுள்ள சாக்கடை:',
      selectCategory: 'ஆபத்து வகையைத் தேர்ந்தெடுக்கவும்:',
      waterlogging: 'தெரு வெள்ளம்',
      blockedInlet: 'அடைபட்ட சாக்கடை',
      drainOverflow: 'வடிகால் வழிதல்',
      sewerBackflow: 'சாக்கடை பின்வழிதல்',
      severityLabel: 'கணிக்கப்பட்ட அடைப்பின் அளவு:',
      penalty: 'கட்டுப்பாடு',
      reportTitle: 'புகார் தலைப்பு:',
      titlePlaceholder: 'எ.கா. குப்பைகளால் அடைபட்ட சாக்கடை',
      notesLabel: 'கூடுதல் விவரங்கள்:',
      notesPlaceholder: 'நீரின் ஆழம், போக்குவரத்து அடைப்பு பற்றி குறிப்பிடவும்...',
      attachPhoto: 'புகைப்பட ஆதாரத்தை இணைக்கவும்:',
      clearPhoto: 'அழி',
      sampleClogPhoto: 'அடைப்பு புகைப்பட மாதிரி',
      sampleFloodPhoto: 'வெள்ள புகைப்பட மாதிரி',
      photoAttached: 'புகைப்படம் இணைக்கப்பட்டது',
      reporterHandle: 'பெயர் / வார்டு:',
      reporterPlaceholder: 'எ.கா. KurlaResident_WardL',
      submitBtn: 'புகாரைச் சமர்ப்பிக்கவும்',
      liveStreamHeader: 'நேரலை பொதுமக்கள் புகார்கள்',
      crowdObsSub: 'நிபுணர்களால் சரிபார்க்கப்பட்ட நேரலைத் தகவல்கள்.',
      statusLabel: 'நிலை:',
      allReports: 'அனைத்து புகார்கள்',
      photoEvidence: 'புகைப்பட ஆதாரம்',
      verifiedByBmc: 'நகராட்சியால் உறுதி செய்யப்பட்டது',
    },
    hydroRouting: {
      engineBadge: 'ஹைட்ரோ-வழிகாட்டி இன்ஜின்',
      scadaChainValidated: 'SHA-256 SCADA சங்கிலி உறுதி செய்யப்பட்டது',
      title: 'மழைநீர் திருப்பிவிடும் & சேமிப்பு மையம்',
      subTitle: 'வெள்ளம் பெருக்கெடுக்கும் பகுதியிலிருந்து தண்ணீரை கழிவுநீர் சுத்திகரிப்பு நிலையங்கள் (STP) மற்றும் நிலத்தடி நீர் செறிவூட்டல் கிணறுகளுக்கு திருப்புதல்.',
      triggerAutoDiversion: 'தானியங்கி நீர் திருப்பலை இயக்கு',
      executingDiversion: 'திருப்பப்படுகிறது...',
      syncBtn: 'புதுப்பி',
      divertedVolume: 'திருப்பட்ட நீரின் அளவு',
      activeBypassFlow: 'செயலில் உள்ள ஓட்டம்:',
      activeSluiceGates: 'செயலில் உள்ள கதவுகள்',
      gatesOpen: 'திறக்கப்பட்ட கதவுகள்',
      scadaStatus: 'SCADA நிலை:',
      allResponding: 'அனைத்தும் இயங்குகின்றன',
      bufferHeadroom: 'கிடைக்கக்கூடிய சேமிப்பு அளவு',
      storageRemaining: 'நீர்நிலைகளில் மீதமுள்ள கொள்ளளவு',
      systemAuditLog: 'அமைப்பின் தணிக்கைப் பதிவு',
      tamperProof: 'பாதுகாப்பானது',
      sluiceRegistryTitle: 'நகராட்சி நீர் கதவுகள் பட்டியல்',
      infrastructureSub: 'அதிகப்படியான வெள்ள நீரைப் பெறக்கூடிய கட்டமைப்பு வசதிகள்.',
      filterSink: 'வடிகட்டு:',
      allSinks: 'அனைத்து இடங்கள்',
      stpSinks: 'சுத்திகரிப்பு நிலையங்கள்',
      marSinks: 'நிலத்தடி நீர் கிணறுகள்',
      lakeSinks: 'நகர்ப்புற ஏரிகள்',
      storageFill: 'தற்போதைய நீர் மட்டம்',
      intakeFlow: 'உள்வரும் ஓட்டம்',
      sluiceGate: 'நீர் கதவு',
      adjustActuator: 'கதவு நிலையை மாற்று',
      scadaAuditLedger: 'SCADA செயல்பாட்டுப் பதிவு',
      genesisToHead: 'ஒவ்வொரு கதவு இயக்கத்தையும் உறுதிசெய்யும் பாதுகாப்பான SHA-256 சங்கிலி.',
      blocksVerified: 'உறுதிசெய்யப்பட்ட தொகுதிகள்',
      blockIndex: 'தொகுதி #',
      prevHash: 'முந்தைய ஹேஷ்:',
      overrideModalTitle: 'SCADA கதவு கட்டுப்பாடு',
      targetInfrastructure: 'இலக்கு கட்டமைப்பு:',
      gatePosition: 'கதவு நிலை:',
      openLabel: 'திறந்தது',
      closedLabel: 'மூடியது',
      operationalJustification: 'செயல்பாட்டுக் காரணம் (பதிவு செய்யப்பட்டது):',
      auditLogNotice: 'இந்த மாற்றம் SHA-256 மூலம் ஹேஷ் செய்யப்பட்டு பதிவேட்டில் சேர்க்கப்படும்.',
      cancelBtn: 'ரத்து செய்',
      signDispatchBtn: 'கையொப்பமிடு & இயக்கு',
    },
    nowcast: {
      title: 'AI வெள்ள முன்னறிவிப்பு',
      deepseekBadge: 'Qwen 2.5 3B',
      fallbackBadge: 'மாற்று',
      predicting: 'கணிக்கிறது...',
      refreshBtn: 'புதுப்பி',
      runPredictionBtn: 'முன்னறிவிப்பை இயக்கு',
      emptyStatePrompt: 'ரேடார் மற்றும் வானிலை தரவைப் பயன்படுத்தி வெள்ள முன்னறிவிப்பைப் பெற பட்டனை அழுத்தவும்.',
      reasoningSensorData: 'தரவுகளை AI பகுப்பாய்வு செய்கிறது...',
      riskSuffix: 'ஆபத்து',
      confidenceSuffix: 'நம்பகத்தன்மை',
      outlookHeading: 'நோக்குநிலை',
      nowLabel: 'இப்போது',
      keyRisksHeading: 'முக்கிய ஆபத்துகள்',
      recommendationHeading: 'பரிந்துரை',
      aiReasoningHeading: 'AI விளக்கம்',
      sensorInputsHeading: 'தரவு உள்ளீடுகள்',
    },
    precipitationBadge: {
      liveRadar: 'நேரலை ரேடார்',
      modelEstimate: 'மாதிரி கணிப்பு (மாற்று)',
      noData: 'ரேடார் தரவு இல்லை',
      lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
      decodeConfidence: 'நம்பகத்தன்மை',
      stationCode: 'நிலையக் குறியீடு',
      freshness: 'நேரலை நிலை',
      freshLabel: 'புதியது (10 நிமிடத்திற்குள்)',
      staleLabel: 'பழையது',
      source: 'ஆதாரம்:',
    },
    waterAtlas: {
      atlasBadge: 'நீர்நிலைகள் வரைபடம்',
      coastalSyncBadge: 'கடற்கரை கதவுகள் இணைப்பு',
      title: 'நகர்ப்புற ஏரிகள் & அலைக் கட்டுப்பாடு',
      subTitle: 'நகர்ப்புற ஏரிகளின் நீர் மட்டம், ஆக்கிரமிப்பு அளவுகள் மற்றும் கடலலை சுழற்சியுடன் இணைக்கப்பட்ட தானியங்கி கதவுகள்.',
      highTidePeak: 'அதிகபட்ச அலை (மும்பை துறைமுகம்)',
      flapGateLockout: 'கதவு பூட்டுதல்:',
      preventsBackflow: 'கடல் நீர் நகரத்திற்குள் வருவதைத் தடுக்கிறது',
      urbanReservoirsHeading: 'நகர்ப்புற நீர்த்தேக்கங்கள் & ஏரி கொள்ளளவு',
      totalBufferHeadroom: 'மொத்த வெள்ள சேமிப்பு அளவு:',
      FTL: 'முழு கொள்ளளவு (FTL)',
      storage: 'சேமிப்பு',
      cushion: 'மீதமுள்ள இடம்',
      encroachment: 'ஆக்கிரமிப்பு:',
      priority: 'முன்னுரிமை:',
      coastalOutfallsHeading: 'கடற்கரை நீர் வெளியேற்றக் கதவுகள்',
      tidalFlapSub: 'கடல் நீர் தெருக்களில் புகாமல் இருக்க உயர் அலையின் போது கதவுகள் தானாகவே மூடிக்கொள்ளும்.',
      dischargeRate: 'வெளியேற்ற வேகம்',
      seaInvertHead: 'கடல் நீர் மட்டம்',
    },
    splash: {
      loadingLabel: 'SURGE தளம் இயங்குகிறது',
      title: 'SURGE',
      subtitle: 'நகர்ப்புற வெள்ள முன்னறிவிப்பு அமைப்பு',
    },
    simulationTutorial: {
      bannerTitle: 'சிமுலேஷன் பாதுகாப்பு பேனர்',
      bannerText: 'எப்போதும் மேல் பேனரைச் சரிபார்க்கவும் - இது கடந்த கால வரலாற்று நிகழ்வுகளின் மறுபதிவு.',
      selectorTitle: 'நகரம் மற்றும் நிகழ்வு தேர்வு',
      selectorText: 'நகரங்களை (மும்பை, டெல்லி, சென்னை) மாற்றி 9 வரலாற்று மழைப் பதிவுகளில் இருந்து தேர்ந்தெடுக்கவும்.',
      controlsTitle: 'இயக்கக் கட்டுப்பாடுகள்',
      controlsText: 'பிளே/பாஸ் மற்றும் வேகக் கட்டுப்பாடுகளைப் பயன்படுத்தி வெள்ளப் பதிவை மீண்டும் பார்க்கவும்.',
      provenanceTitle: 'தரவு ஆதாரம் மற்றும் AI பகுப்பாய்வு',
      provenanceText: 'வானிலை பதிவுகள் மற்றும் AI முடிவுகளை படிப்படியாக சரிபார்க்கவும்.',
      mapTitle: 'ஹைட்ராலிக் GIS வரைபடம்',
      mapText: 'வரைபடத்தில் கணிக்கப்பட்ட நீரின் ஆழம் மற்றும் ஆபத்தான பகுதிகளைப் பார்க்கவும்.',
      nextBtn: 'அடுத்தது',
      finishBtn: 'முடி',
      skipBtn: 'தவிர்',
      stepOf: 'படி',
    },
    common: {
      panelTab: 'பேனல்',
      gisMapTab: 'GIS வரைபடம்',
      loadingGis: 'GIS வரைபடம் இயங்குகிறது...',
      loadingCitizenApp: 'சிட்டிசன் ஆப் இயங்குகிறது...',
      loadingOperationsHub: 'இயக்க மையம் இயங்குகிறது...',
    },
  },

  te: {
    nav: {
      brand: 'SURGE',
      subTitle: 'పట్టణ విపత్తు పూర్వానుమాన పోర్టల్',
      backToLanding: 'ముఖ్య పుటకి వెళ్లండి',
      openMeteoApi: 'Open-Meteo API',
      liveWeather: 'లైవ్ వాతావరణం',
      maxDepth: 'గరిష్ట లోతు',
      reportWater: 'నీటి ముంపును నివేదించండి',
      authorityCenter: 'అధికారిక కంట్రోల్ సెంటర్',
      authorityPortal: 'అధికారిక పోర్టల్',
      selectCity: 'నగరాన్ని ఎంచుకోండి',
      selectEvent: 'వర్ష స్థితిని ఎంచుకోండి',
      lakes7: '7 సరస్సులు: 87%',
      reservoirs5: '5 జలాశయాలు: 82%',
      yamunaStage: 'యమునా మట్టం: 204.8m',
    },
    landing: {
      fullForm: 'అతి-స్థానిక ట్రాకింగ్ మరియు జోక్యం కోసం వర్షపాతం మరియు ముంపు ముప్పు అంచనా వ్యవస్థ',
      citizenDashboardBtn: 'పౌర డాష్‌బోర్డ్',
      leadTimeBadge: '0–3 గంటల ముందస్తు అంచనా సమయం',
      heroTitle: 'భూగర్భ మరియు ఉపరితల సమగ్ర వరద నిఘా వ్యవస్థ',
      heroSubtitle: 'వీధుల్లో నీటి లోతు, మ్యాన్‌హోల్ పొంగు మరియు వరద రహిత సురక్షిత మార్గాలను ప్రత్యక్షంగా అంచనా వేయండి.',
      metricLeadTime: '0–3 గంటలు',
      metricHydraulics: '1D + 2D',
      metricPrecision: 'వీధి-స్థాయి',
      metricDetours: '100%',
      metricLeadTimeSub: 'ముందస్తు సమయం',
      metricHydraulicsSub: 'సమగ్ర హైడ్రాలిక్స్',
      metricPrecisionSub: 'లోతు ఖచ్చితత్వం (సెం.మీ)',
      metricDetoursSub: 'సురక్షిత ప్రత్యామ్నాయ మార్గాలు',
      selectCityTitle: 'మెట్రో సిటీ కంట్రోల్ సెంటర్‌ను ఎంచుకోండి',
      selectCitySub: 'లైవ్ GIS వరద డాష్‌బోర్డ్ తెరవడానికి క్రింద నగరాన్ని ఎంచుకోండి',
      liveRadar: 'లైవ్ రాడార్',
      highRiskHotspots: 'అధిక ప్రమాద రహిత ప్రాంతాలు:',
      authorityLoginDomain: 'అధికారిక లాగిన్:',
      launchDashboard: 'డాష్‌బోర్డ్ ప్రారంభించు',
      authorityLoginBtn: 'అధికారిక లాగిన్',
      simTitle: 'ఇంటరాక్టివ్ వర్షపు నీటి రన్-ఆఫ్ సిమ్యులేటర్',
      simSub: 'నీటి ముంపును పరీక్షించడానికి వర్షపాత తీవ్రతను సర్దుబాటు చేయండి',
      simRainRate: 'సిమ్యులేటెడ్ వర్షపాతం:',
      moderate: 'సాధారణ (15 మిమీ/గం)',
      heavy: 'భారీ వర్షం (45 మిమీ/గం)',
      cloudburst: 'మేఘ విస్ఫోటనం (85 మిమీ/గం)',
      predictedDepth: 'అంచనా వేసిన నీటి లోతు:',
      underpassLocation: 'దిగువ అండర్‌పాస్ వద్ద',
      capacityExceeded: 'డ్రైనేజీ సామర్థ్యం మించిపోయింది (>100%). వీధి పైకి నీరు.',
      capacityAdequate: 'డ్రైనేజీ సామర్థ్యం సరిపోతుంది.',
      faqTitle: 'తరచుగా అడిగే ప్రశ్నలు',
      faqBadge: 'ముఖ్యమైన ప్రశ్నలు',
      faqMainHeading: 'SURGE గురించి మీరు తెలుసుకోవాల్సిన విషయాలు',
      footerTitle: 'SURGE • పట్టణ విపత్తు హైడ్రో-డైనమిక్ అంచనా వ్యవస్థ',
      footerSub: 'భూ విజ్ఞాన మంత్రిత్వ శాఖ (MoES) • జాతీయ మధ్యస్థ వాతావరణ సూచన కేంద్రం (NCMRWF)',
      feature1Title: 'సమగ్ర 1D + 2D హైడ్రాలిక్స్',
      feature1Sub: 'రాడార్ వర్షపాతం, 2D ఉపరితల నీరు మరియు 1D భూగర్భ కాలువల నెట్‌వర్క్‌ను అనుసంధానిస్తుంది.',
      feature2Title: 'వరద రహిత నావిగేషన్ API',
      feature2Sub: 'నీటమునిగిన రోడ్ల నుండి వాహనాలను సురక్షిత ప్రత్యామ్నాయ మార్గాల్లోకి మళ్లిస్తుంది.',
      feature3Title: 'అధికారిక SitRep నివేదిక ఎగుమతి',
      feature3Sub: 'విపత్తు నిర్వహణ బృందాలకు పంప్ నియంత్రణలు మరియు అధికారిక నివేదిక డౌన్‌లోడ్‌ను అందిస్తుంది.',
    },
    faqs: [
      {
        q: 'మున్సిపల్ అధికారులు లాగిన్ కావడానికి ఏ వివరాలు ఉపయోగిస్తారు?',
        a: 'అధికారులు తమ అధికారిక సిటీ డొమైన్ (ఉదా: mumbai.aqua.gov.in, delhi.aqua.gov.in, chennai.aqua.gov.in) మరియు పాస్‌కోడ్: 12345678 ఉపయోగించి లాగిన్ అవుతారు.'
      },
      {
        q: 'SURGE 0–3 గంటల ముందే వరదలను ఎలా అంచనా వేస్తుంది?',
        a: 'SURGE లైవ్ డాప్లర్ రాడార్ వర్షపాతం, 2D డిజిటల్ ఎలివేషన్ మోడల్ (DEM) మరియు 1D భూగర్భ డ్రైనేజీ నెట్‌వర్క్‌ను అనుసంధానించి ఖచ్చితంగా అంచనా వేస్తుంది.'
      },
      {
        q: 'ప్రస్తుతం ఏ భారతీయ నగరాలు అందుబాటులో ఉన్నాయి?',
        a: 'ముంబై, ఢిల్లీ NCR మరియు చెన్నై.'
      },
      {
        q: 'వరద రహిత సురక్షిత నావిగేషన్ ఎలా పనిచేస్తుంది?',
        a: 'నీటి లోతు ఆధారంగా వాహనాలను సురక్షిత ప్రత్యామ్నాయ మార్గాల్లోకి మళ్లిస్తుంది.'
      },
      {
        q: 'పౌరులు నిజసమయ వివరాలను ఎలా సమర్పించవచ్చు?',
        a: '"నీటి ముంపు నివేదించండి" బటన్‌పై క్లిక్ చేసి సమాచారం మరియు ఫోటోలను పంపవచ్చు.'
      }
    ],
    routing: {
      title: 'వరద రహిత అత్యవసర మార్గ నిర్దేశకం',
      subTitle: 'లైవ్ వరద అంచనాల ఆధారంగా సురక్షితమైన ప్రయాణ మార్గాన్ని లెక్కిస్తుంది',
      originPlaceholder: 'ప్రారంభ స్థానం / ప్రస్తుత GPS',
      destPlaceholder: 'గమ్యస్థానం / ఆసుపత్రి / ఆశ్రమం',
      pickOrigin: 'మ్యాప్‌పై ఎంచుకోండి',
      pickDest: 'గమ్యాన్ని ఎంచుకోండి',
      pinned: 'మ్యాప్‌పై గుర్తించబడింది',
      carSedan: 'కార్ / సెడాన్',
      ambulance: 'అంబులెన్స్ (అత్యవసరం)',
      autoBike: 'ఆటో / బైక్',
      pedestrian: 'నడక ద్వారా',
      findRoute: 'సురక్షిత మార్గాన్ని కనుగొను',
      calculating: 'మార్గం లెక్కిస్తోంది...',
      distance: 'దూరం',
      eta: 'అంచనా సమయం',
      riskScore: 'మార్గ ప్రమాదం',
      riskSafe: 'సురక్షిత మార్గం (0-10 సెం.మీ)',
      riskModerate: 'మధ్యస్థ ముంపు (10-25 సెం.మీ)',
      riskHigh: 'అధిక ప్రమాదం (25-45 సెం.మీ)',
      riskImpassable: 'వెళ్లలేని మార్గం (>45 సెం.మీ)',
      turnByTurn: 'సురక్షిత మలుపుల నావిగేషన్',
      noRouteFound: 'సురక్షిత మార్గం లభించలేదు. ప్రత్యామ్నాయ పాయింట్లను ఎంచుకోండి.',
      pickLocationPrompt: 'స్థానాన్ని ఎంచుకోవడానికి మ్యాప్‌పై క్లిక్ చేయండి',
      clearRoute: 'మార్గాన్ని తొలగించు',
      vehicleProfileClearance: 'వాహనం ప్రొఫైల్ మరియు క్లియరెన్స్ పరిమితి:',
      maxSafe: 'గరిష్ట సురక్షితం:',
      hatchback: 'హ్యాచ్‌బ్యాక్',
      suv: 'ఎస్.యు.వి 4x4',
      bus: 'బస్సు / బరువైన వాహనం',
      realRoadSafeRoute: 'SURGE నిజమైన రోడ్డు వరద సురక్షిత మార్గం',
      noSafeRouteFor: 'దీనికి సురక్షిత మార్గం లేదు:',
      selectHazardZone: 'వరద ప్రమాద ప్రాంతాన్ని ఎంచుకోండి:',
      nearestShelter: 'సమీప సురక్షిత పునరావాస కేంద్రం',
      rescueVehicleRoute: 'రక్షణ వాహన మార్గం',
    },
    alerts: {
      title: 'లైవ్ విపత్తు హెచ్చరికలు',
      subTitle: 'ప్రత్యక్ష నీటి ముంపు మరియు డ్రైనేజీ పొంగు నివేదికలు',
      tabAll: 'అన్ని హెచ్చరికలు',
      tabInundation: 'వీధి ముంపు',
      tabSurcharge: 'డ్రైనేజీ పొంగు',
      tabReports: 'పౌరుల నివేదికలు',
      critical: 'తీవ్రమైనది',
      warning: 'హెచ్చరిక',
      advisory: 'సూచన',
      helplineTitle: 'అత్యవసర సహాయ సంఖ్యలు',
      ndrfHelpline: 'NDRF కంట్రోల్ రూమ్',
      controlRoom: 'మున్సిపల్ కంట్రోల్ రూమ్',
      disasterLine: 'విపత్తు సహాయ సంఖ్య',
      reportedAgo: 'నిమిషాల క్రితం',
      verified: 'ధృవీకరించబడింది',
      unverified: 'ధృవీకరించబడలేదు',
      borough: 'మండలం / ప్రాంతం',
      elevation: 'ఎత్తు',
      overcapacity: 'సామర్థ్యానికి మించి',
      surfaceSpill: 'ఉపరితల నీటి పొంగు',
      hydraulicBackflow: 'డ్రైనేజీ బ్యాక్‌ఫ్లో',
      noAlerts: 'ఈ సమయానికి ఎటువంటి తీవ్రమైన వరద ముప్పు లేదు.',
    },
    slider: {
      title: '0–3 గంటల వరద ముందస్తు అంచనా స్లైడర్',
      subTitle: 'వరద పరిస్థితిని ముందుగానే చూడటానికి స్లైడర్‌ను జరపండి',
      play: 'ప్లే చేయండి',
      pause: 'ఆపండి',
      reset: 'ప్రస్తుత సమయం',
      nowLive: 'ఇప్పుడు (లైవ్)',
      plusMin: 'నిమి',
      plusHour: 'గం',
      rainRateLabel: 'వర్షపాత తీవ్రత:',
      forecastDepthLabel: 'గరిష్ట లోతు:',
    },
    reportModal: {
      title: 'నీటి ముంపును నివేదించండి',
      subTitle: 'కంట్రోల్ రూమ్‌కు నిజసమయ వివరాలు అందించి సహాయపడండి',
      locationLabel: 'ప్రాంతం / మైలురాయి',
      depthLabel: 'నీటి లోతు (సెం.మీ)',
      photoLabel: 'ఫోటో అప్‌లోడ్ చేయండి (ఐచ్ఛికం)',
      photoNote: 'ముంపు ఫోటోను ఎంచుకోండి',
      obsLabel: 'అదనపు వివరాలు',
      obsPlaceholder: 'నిలిచిపోయిన వాహనాలు, మూసుకుపోయిన కాలువల గురించి తెలపండి...',
      helpCheck: 'వెంటనే అత్యవసర సహాయం కావాలి',
      submitBtn: 'నివేదిక సమర్పించండి',
      submitting: 'సమర్పిస్తోంది...',
      cancelBtn: 'రద్దు చేయి',
      successToast: 'నివేదిక మున్సిపల్ కంట్రోల్ రూమ్‌కు విజయవంతంగా పంపబడింది!',
    },
    authModal: {
      title: 'విపత్తు నిర్వహణ అధికారుల లాగిన్',
      subTitle: 'భూగర్భ డేటా మరియు పంప్ నియంత్రణలను పొందండి',
      domainLabel: 'అధికారిక డొమైన్ / ID',
      domainPlaceholder: 'ఉదా: mumbai.aqua.gov.in',
      passcodeLabel: 'పాస్‌కోడ్',
      passcodePlaceholder: '8 అంకెల పాస్‌కోడ్ నమోదు చేయండి',
      loginBtn: 'లాగిన్ అవ్వండి',
      loggingIn: 'తనిఖీ చేస్తోంది...',
      demoNote: 'డెమో పాస్‌కోడ్:',
      invalidCredentials: 'చెల్లని వివరాలు. డెమో పాస్‌కోడ్ 12345678 ఉపయోగించండి.',
    },
    dashboard: {
      title: 'విపత్తు నిర్వహణ కంట్రోల్ సెంటర్',
      subTitle: 'లైవ్ మున్సిపల్ వరద డేటా మరియు పంప్ నియంత్రణ',
      officerBadge: 'ప్రస్తుత అధికారి:',
      totalSubmerged: 'మునిగిపోయిన రోడ్లు',
      surchargingPipes: 'పొంగుతున్న కాలువలు',
      pumpsActive: 'పనిచేస్తున్న పంపులు',
      exportSitRep: 'SitRep నివేదిక డౌన్‌లోడ్ చేయండి',
      pumpControllerTitle: 'వాటర్ పంపింగ్ స్టేషన్ నిర్వహణ',
      pumpStatus: 'పంప్ స్థితి',
      activatePump: 'పంప్ ప్రారంభించు (1500 L/s)',
      deactivatePump: 'స్టాండ్‌బై మోడ్',
      groundTruthTitle: 'పౌరుల నివేదికల తనిఖీ',
      verifyBtn: 'ధృవీకరించు & చర్య తీసుకో',
      dismissBtn: 'తిరస్కరించు',
      statusPending: 'పరిశీలనలో ఉంది',
      statusVerified: 'ధృవీకరించబడింది',
      statusDismissed: 'తిరస్కరించబడింది',
      evacRouteBtn: 'తరలింపు ప్రణాళిక తయారుచేయి',
    },
    sitrep: {
      title: 'పరిస్థితి నివేదిక (SitRep) ఎగుమతి',
      subTitle: 'ఉన్నతాధికారుల కోసం అధికారిక వరద నివేదిక తయారు చేయండి',
      generatePdf: 'SitRep PDF డౌన్‌లోడ్',
      downloadCsv: 'CSV డేటా ఎగుమతి',
      downloadJson: 'JSON డేటా ఎగుమతి',
      generating: 'నివేదిక తయారవుతోంది...',
      summaryHeading: 'వరద పరిస్థితి సారాంశం',
      criticalZones: 'ముఖ్యమైన ప్రమాదకర ప్రాంతాలు:',
    },
    tide: {
      title: 'సముద్ర అ అలలు & జలాశయ మట్టాలు',
      highTideCountdown: 'తదుపరి అలై సమయం:',
      nextHighTide: 'అలై ఎత్తు:',
      seaLevel: 'సముద్ర మట్టం:',
      reservoirStorage: 'జలాశయ నీటి నిల్వ:',
      lakesRunway: 'నీటి సరఫరా రోజులు:',
    },
    drainage: {
      title: 'భూగర్భ డ్రైనేజీ నెట్‌వర్క్',
      undergroundGraph: '1D భూగర్భ కాలువలు',
      coupledSurface: 'ఉపరితల నీరు',
      pipeDischarge: 'గరిష్ట ప్రవాహ వేగం',
      capacityUsage: 'సామర్థ్య వినియోగం',
      criticalNodes: 'పొంగుతున్న కాలువలు',
    },
    map: {
      layers: 'మ్యాప్ లేయర్లు',
      basemapVector: 'రోడ్డు మ్యాప్',
      basemapSat: 'శాటిలైట్ మ్యాప్',
      inundationMesh: 'నీటి లోతు',
      pipeGraph: 'డ్రైనేజీ నెట్‌వర్క్',
      citizenReports: 'పౌరుల నివేదికలు',
      legendTitle: 'నీటి లోతు సూచిక',
      depthSafe: '< 10 సెం.మీ (సురక్షితం)',
      depthModerate: '10 – 25 సెం.మీ (జాగ్రత్త)',
      depthHigh: '25 – 45 సెం.మీ (అధిక ప్రమాదం)',
      depthSevere: '> 45 సెం.మీ (వెళ్లలేరు)',
      surchargingNode: 'మ్యాన్‌హోల్ పొంగు',
      safeRoute: 'సురక్షిత ప్రత్యామ్నాయ మార్గం',
      popupRoad: 'రోడ్డు:',
      popupDepth: 'అంచనా వేసిన లోతు:',
      popupStatus: 'స్థితి:',
      popupPassable: 'వాహనాలు వెళ్ళవచ్చు',
      popupImpassable: 'వరద నీరు - వెళ్లకండి',
    },
    evacuationModal: {
      title: 'అత్యవసర తరలింపు & మార్గదర్శక ప్రణాళిక',
      subTitle: 'మీ వాహన సామర్థ్యం ఆధారంగా దశలవారీ సురక్షిత మార్గ నిర్దేశం',
      selectVehicle: 'మీ వాహన రకాన్ని ఎంచుకోండి:',
      hazardZone: 'ప్రస్తుత వరద ప్రమాద ప్రాంతం',
      shelterHeading: 'సమీప సురక్షిత పునరావాస కేంద్రం',
      elevationGain: 'ఎత్తు లాభం',
      stepByStepHeading: 'దశలవారీ తరలింపు ప్రయాణ ప్రణాళిక',
      step1Title: 'దశ 1: తక్షణ సన్నాహం & నీటి పరిమితి తనిఖీ',
      step2Title: 'దశ 2: మునిగిన రోడ్లు & అండర్‌పాస్‌లను నివారించడం',
      step3Title: 'దశ 3: మలుపుల వారీగా సురక్షిత మార్గ నిర్దేశం',
      step4Title: 'దశ 4: పునరావాస కేంద్రానికి చేరుకోవడం & నమోదు',
      deployMapBtn: 'మ్యాప్‌పై సురక్షిత మార్గాన్ని చూడండి',
      closeBtn: 'ప్రణాళికను మూసివేయి',
    },
    citizenApp: {
      appTitle: 'SURGE పౌరుల పోర్టల్',
      appSubtitle: 'వీధి నీటి ముంపు హెచ్చరికలు, లైవ్ GPS సురక్షిత నావిగేషన్ & నివేదికలు',
      tabGis: 'GIS మ్యాప్ & లేయర్లు',
      tabAlerts: 'లైవ్ విపత్తు హెచ్చరికలు',
      tabRoute: 'వాహన సురక్షిత మార్గం',
      tabReport: 'నీటి ముంపు నివేదిక నమోదు',
      useLiveGps: 'నా లైవ్ GPS స్థానాన్ని ఉపయోగించండి',
      gpsAcquired: 'లైవ్ GPS స్థానం పొందింది',
      gpsDenied: 'GPS అనుమతి నిరాకరించబడింది',
      locateMe: 'నా స్థానాన్ని గుర్తించు',
      launchCitizenApp: 'సిటిజన్ యాప్ తెరవండి',
      tabEmergency: 'అత్యవసర పరిచయాలు',
    },
    emergencyServices: {
      title: 'భారతీయ అత్యవసర హెల్ప్‌లైన్లు',
      subTitle: 'విపత్తు సహాయం మరియు వైద్య సహాయం కోసం 1-ట్యాప్ టోల్-ఫ్రీ నంబర్లు',
      callNow: 'కాల్ చేయండి',
      tollFree: '24x7 టోల్-ఫ్రీ',
      ndrfTitle: 'NDRF విపత్తు సహాయ నియంత్రణ గది',
      ndrfDesc: 'జాతీయ విపత్తు ప్రతిస్పందన దళం (NDRF) వరద రక్షణ, పడవల ద్వారా తరలింపు మరియు భారీ వర్ష సహాయ చర్యలు.',
      national112Title: 'అఖిల భారత సమగ్ర అత్యవసర సంఖ్య',
      national112Desc: 'అన్ని భారతీయ రాష్ట్రాలు మరియు కేంద్రపాలిత ప్రాంతాల కోసం ఒకే అత్యవసర హెల్ప్‌లైన్ నంబర్.',
      municipal1916Title: 'మున్సిపల్ కార్పొరేషన్ విపత్తు నిర్వహణ గది',
      municipal1916Desc: 'మున్సిపల్ కార్పొరేషన్ (BMC/NDMC/GCC) పట్టణ వరద హెల్ప్‌లైన్ మరియు నీటి తోడే పంపుల నిర్వహణ.',
      ambulance108Title: 'అత్యవసర వైద్య మరియు ఆంబులెన్స్ సేవలు',
      ambulance108Desc: 'ఉచిత అత్యవసర వైద్య ఆంబులెన్స్ మరియు వరద బాధితుల రవాణా సేవలు.',
      fire101Title: 'ఫైర్ బ్రిగేడ్ మరియు వరద నీటి రక్షణ దళం',
      fire101Desc: 'నీటిలో చిక్కుకున్న వాహనాల వెలికితీత మరియు ప్రజల సురక్షిత తరలింపు.',
      police100Title: 'పోలీస్ కంట్రోల్ రూమ్ మరియు ట్రాఫిక్ పోలీస్',
      police100Desc: 'అత్యవసర రక్షణ మరియు వరద ప్రభావిత రహదారుల్లో ట్రాఫిక్ మళ్లింపు.',
      coastal1093Title: 'కోస్టల్ సెక్యూరిటీ మరియు అలల పర్యవేక్షణ',
      coastal1093Desc: 'భారతీయ తీర రక్షణ దళం తుఫాను హెచ్చరికలు మరియు తీర ప్రాంత వరద సహాయం.',
    },
    voiceNav: {
      voiceGuide: 'వాయిస్ నావిగేషన్',
      speaking: 'ఆడియో రన్ అవుతోంది...',
      stopVoice: 'వాయిస్ ఆపు',
      inMeters: '{distance} మీటర్లలో',
      turnLeft: 'ఎడమవైపు తిరగండి',
      turnRight: 'కుడివైపు తిరగండి',
      proceedStraight: 'నేరుగా ముందుకు వెళ్లండి',
      hazardWarning: 'హెచ్చరిక! ముందు నీటిలో మునిగిన అండర్‌పాస్ ఉంది. ప్రత్యామ్నాయ మార్గం తీసుకోండి.',
      destinationArrived: 'మీరు సురక్షితమైన ఎత్తైన ఆశ్రయ కేంద్రానికి చేరుకున్నారు.',
    },
    sidebar: {
      nowcastGis: 'GIS వరద మ్యాప్',
      hydroRouting: 'హైడ్రో రూటింగ్',
      citizenSignals: 'పౌరుల సంకేతాలు',
      adminModeration: 'సమీక్ష వరస',
      waterBodies: 'జల వనరుల అట్లాస్',
      simulationReplay: 'సిమ్యులేషన్ రీప్లే',
      authorityMode: 'అధికారిక మోడ్',
    },
    simulation: {
      title: 'రియల్-టైమ్ హైడ్రాలిక్ రన్-ఆఫ్ సిమ్యులేషన్ రీప్లే',
      subTitle: 'చారిత్రక వర్షపాతం మరియు డ్రైనేజీ నెట్‌వర్క్ సామర్థ్యాన్ని పరీక్షించండి',
      benchmarkTitle: 'చారిత్రక బెంచ్ మార్క్ రీప్లేలు',
      selectScenario: 'వర్షపాత రికార్డును ఎంచుకోండి',
      rainIntensity: 'వర్షపాత తీవ్రత',
      solverTelemetry: 'హైడ్రాలిక్ టెలిమెట్రీ',
      runReplay: 'సిమ్యులేషన్ ప్రారంభించు',
      pauseReplay: 'ఆపు',
      resetReplay: 'రీసెట్ చేయి',
      historicalBenchmarks: 'చారిత్రక వర్షపాత రికార్డులు',
    },
    adminModeration: {
      portalBadge: 'మున్సిపల్ కంట్రోల్ & పరిపాలన పోర్టల్',
      title: 'డ్రైనేజీ అవరోధాలు & అత్యవసర బృందాల నిర్వహణ',
      subTitle: 'పౌరులు నివేదించిన కాలువల మూసివేత మరియు డ్రైనేజీ పొంగును తనిఖీ చేయండి. ఆమోదిస్తే వరద మోడల్‌లో సామర్థ్యం స్వయంచాలకంగా నవీకరించబడుతుంది.',
      syncQueue: 'జాబితా సింక్ చేయి',
      pendingOperator: 'అధికారి పరిశీలనలో ఉంది',
      awaitingTriage: 'పరిశీలనకై నిరీక్షణ',
      crowdsourcedReports: 'పౌరుల నివేదికలు',
      validatedBottlenecks: 'ధృవీకరించబడిన అవరోధాలు',
      activeHotspots: 'ప్రస్తుత ప్రమాద ప్రాంతాలు',
      flowVelocities: 'నీటి ప్రవాహ వేగాన్ని ప్రభావితం చేస్తోంది',
      clogsCleared: 'తొలగించబడిన అవరోధాలు',
      fullyRestored: 'పూర్తిగా పునరుద్ధరించబడింది',
      desiltingCompleted: 'పూడిక తీత పనులు పూర్తయ్యాయి',
      meshMultiplier: 'హైడ్రాలిక్ సామర్థ్య గుణకం',
      capacity: 'సామర్థ్యం',
      swmmCalibration: 'లైవ్ SWMM కాలిబ్రేషన్',
      triageStream: 'పరిశీలన & చర్యల వరుస',
      pending: 'పరిశీలనలో ఉంది',
      validated: 'ధృవీకరించబడింది',
      resolved: 'పరిష్కరించబడింది',
      allReports: 'అన్ని నివేదికలు',
      noReports: 'ఈ విభాగంలో నివేదికలు లేవు. వ్యవస్థ సాధారణంగా పనిచేస్తోంది.',
      reporter: 'నివేదించిన వారు',
      coordinates: 'అక్షాంశ రేఖాంశాలు',
      verifiedBy: 'ధృవీకరించిన వారు',
      verifyRestrict: 'ధృవీకరించు & నిరోధించు',
      dispatchCrew: 'బృందాన్ని పంపు & పరిష్కరించు',
      clogCleared: 'అవరోధం తొలగించబడింది',
    },
    chatbot: {
      title: 'SURGE AI సహాయ కేంద్రం',
      liveScada: 'లైవ్ SCADA & సమాచారం అనుసంధానించబడింది',
      quotaLabel: 'పరిమితి',
      minimizeModal: 'చిన్నది చేయి',
      expandModal: 'పెద్దది చేయి',
      clearHistory: 'చరిత్రను తొలగించు',
      closeModal: 'చాట్ మూసివేయి',
      rateLimitActive: 'పరిమితి పూర్తయింది. సమయం:',
      suggestedQueries: 'సూచించిన ప్రశ్నలు:',
      inputPlaceholder: 'రోడ్డు భద్రత, రాడార్, వరదల గురించి అడగండి...',
      sendBtn: 'పంపు',
      vehicleSafetyCat: 'వాహన భద్రత',
      vehicleSafetyQuery: '35 సెం.మీ నీటిలో హ్యాచ్‌బ్యాక్ లేదా సెడాన్ వాహనం సురక్షితంగా వెళ్లగలదా?',
      radarCat: 'రాడార్ & అంచనాలు',
      radarQuery: 'SURGE డాప్లర్ రాడార్ సమాచారాన్ని డ్రైనేజీ వ్యవస్థతో ఎలా అనుసంధానిస్తుంది?',
      evacuationCat: 'తరలింపు',
      evacuationQuery: 'సమీపంలోని ఎత్తైన వరద పునరావాస కేంద్రాన్ని ఎలా కనుగొనాలి?',
      scadaCat: 'SCADA డేటా',
      scadaQuery: 'లైవ్ హెచ్చరికలు మరియు అలల మట్టాల అర్థం ఏమిటి?',
    },
    citizenSignal: {
      groundTruthBadge: 'పౌరుల ప్రత్యక్ష సమాచార పొర',
      swmmModelFeedback: 'నేరుగా SWMM మోడల్ ఫీడ్‌బ్యాక్',
      title: 'డ్రైనేజీ మూసివేత & నీటి ముంపు నివేదిక కేంద్రం',
      subTitle: 'మూసుకుపోయిన కాలువలు మరియు నీటి నిల్వలను ప్రత్యక్షంగా నివేదించండి. ధృవీకరించబడిన వివరాలు డ్రైనేజీ సామర్థ్యాన్ని నవీకరిస్తాయి.',
      cityCapacityFactor: 'నగర హైడ్రాలిక్ సామర్థ్య పరిమితి',
      activeHotspots: 'ప్రస్తుత ప్రమాద ప్రాంతాలు',
      submitHazardHeader: 'ప్రమాద వివరాలను సమర్పించండి',
      locationSub: 'స్థానం సమీప మున్సిపల్ మ్యాన్‌హోల్‌తో స్వయంచాలకంగా అనుసంధానించబడుతుంది.',
      incidentLocation: 'సంఘటన ప్రాంతం:',
      autoGps: 'ఆటో GPS',
      detecting: 'గుర్తిస్తోంది...',
      nearestManhole: 'సమీప డ్రైనేజీ మ్యాన్‌హోల్:',
      selectCategory: 'ప్రమాద రకాన్ని ఎంచుకోండి:',
      waterlogging: 'వీధి నీటి ముంపు',
      blockedInlet: 'మూసుకుపోయిన కాలువ',
      drainOverflow: 'డ్రైనేజీ పొంగు',
      sewerBackflow: 'కాలువ బ్యాక్‌ఫ్లో',
      severityLabel: 'అంచనా వేసిన అవరోధ తీవ్రత:',
      penalty: 'పరిమితి',
      reportTitle: 'నివేదిక శీర్షిక:',
      titlePlaceholder: 'ఉదా: చెత్తతో మూసుకుపోయిన కాలువ',
      notesLabel: 'అదనపు వివరాలు:',
      notesPlaceholder: 'నీటి లోతు, ట్రాఫిక్ ఇబ్బందులను వివరించండి...',
      attachPhoto: 'ఫోటో చిత్రాన్ని జత చేయండి:',
      clearPhoto: 'తొలగించు',
      sampleClogPhoto: 'నమూనా కాలువ ఫోటో',
      sampleFloodPhoto: 'నమూనా వరద ఫోటో',
      photoAttached: 'ఫోటో జతచేయబడింది',
      reporterHandle: 'పేరు / వార్డు:',
      reporterPlaceholder: 'ఉదా: KurlaResident_WardL',
      submitBtn: 'నివేదికను సమర్పించండి',
      liveStreamHeader: 'లైవ్ పౌరుల నివేదికల వరుస',
      crowdObsSub: 'నిపుణులచే ధృవీకరించబడిన ప్రత్యక్ష సమాచారం.',
      statusLabel: 'స్థితి:',
      allReports: 'అన్ని నివేదికలు',
      photoEvidence: 'ఫోటో ఆధారాలు',
      verifiedByBmc: 'మున్సిపాలిటీ ధృవీకరించింది',
    },
    hydroRouting: {
      engineBadge: 'హైడ్రో-రూటింగ్ ఇంజిన్',
      scadaChainValidated: 'SHA-256 SCADA సరుకు ధృవీకరించబడింది',
      title: 'వరద నీటి మళ్లింపు & నిల్వ వ్యవస్థ',
      subTitle: 'వరద ముంపు ప్రాంతాల నుండి నీటిని వ్యర్థ నీటి శుద్ధి కేంద్రాలు (STP) మరియు భూగర్భ జల పునరుద్ధరణ బావులకు మళ్లించడం.',
      triggerAutoDiversion: 'ఆటో-డైవర్షన్ ప్రారంభించు',
      executingDiversion: 'మళ్లిస్తోంది...',
      syncBtn: 'సింక్',
      divertedVolume: 'మళ్లించిన నీటి పరిమాణం',
      activeBypassFlow: 'ప్రస్తుత బైపాస్ ప్రవాహం:',
      activeSluiceGates: 'పనిచేస్తున్న గేట్లు',
      gatesOpen: 'తెరిచిన గేట్లు',
      scadaStatus: 'SCADA స్థితి:',
      allResponding: 'అన్నీ పనిచేస్తున్నాయి',
      bufferHeadroom: 'అందుబాటులో ఉన్న నిల్వ సామర్థ్యం',
      storageRemaining: 'జలాశయాల్లో మిగిలి ఉన్న స్థలం',
      systemAuditLog: 'సిస్టమ్ ఆడిట్ లాగ్',
      tamperProof: 'సురక్షితమైనది',
      sluiceRegistryTitle: 'మున్సిపల్ గేట్లు & నిల్వ కేంద్రాల జాబితా',
      infrastructureSub: 'అదనపు వరద నీటిని స్వీకరించగల నిల్వ కేంద్రాలు.',
      filterSink: 'ఫిల్టర్ చేయి:',
      allSinks: 'అన్ని కేంద్రాలు',
      stpSinks: 'శుద్ధి కేంద్రాలు (STP)',
      marSinks: 'భూగర్భ జల బావులు',
      lakeSinks: 'నగర చెరువులు',
      storageFill: 'ప్రస్తుత నీటి నిల్వ',
      intakeFlow: 'ఇన్-టేక్ ప్రవాహం',
      sluiceGate: 'గేట్',
      adjustActuator: 'గేట్ స్థానాన్ని మార్చు',
      scadaAuditLedger: 'SCADA నిర్వహణ ఆడిట్ వివరాలు',
      genesisToHead: 'ప్రతి గేట్ కదలికను ధృవీకరించే సురక్షితమైన SHA-256 సరుకు.',
      blocksVerified: 'ధృవీకరించబడిన బ్లాక్‌లు',
      blockIndex: 'బ్లాక్ #',
      prevHash: 'మునుపటి హ్యాష్:',
      overrideModalTitle: 'SCADA గేట్ నియంత్రణ',
      targetInfrastructure: 'లక్ష్య నిల్వ కేంద్రం:',
      gatePosition: 'గేట్ స్థానం:',
      openLabel: 'తెరిచింది',
      closedLabel: 'మూసింది',
      operationalJustification: 'నిర్వహణ కారణం (నమోదు చేయబడింది):',
      auditLogNotice: 'ఈ మార్పు SHA-256 తో హ్యాష్ చేయబడి బ్లాక్‌చెయిన్ లాగ్‌కు జతచేయబడుతుంది.',
      cancelBtn: 'రద్దు చేయి',
      signDispatchBtn: 'సంతకం చేయి & అమలు చేయి',
    },
    nowcast: {
      title: 'AI వరద ముందస్తు అంచనా',
      deepseekBadge: 'Qwen 2.5 3B',
      fallbackBadge: 'ప్రత్యామ్నాయం',
      predicting: 'అంచనా వేస్తోంది...',
      refreshBtn: 'నవీకరించు',
      runPredictionBtn: 'అంచనా వేయండి',
      emptyStatePrompt: 'రాడార్ మరియు వాతావరణ వివరాల ఆధారంగా వరద అంచనా పొందడానికి బటన్ నొక్కండి.',
      reasoningSensorData: 'సమాచారాన్ని AI విశ్లేషిస్తోంది...',
      riskSuffix: 'ప్రమాదం',
      confidenceSuffix: 'ఖచ్చితత్వం',
      outlookHeading: 'రాబోయే సమయం',
      nowLabel: 'ఇప్పుడు',
      keyRisksHeading: 'ముఖ్య ప్రమాదాలు',
      recommendationHeading: 'సూచన',
      aiReasoningHeading: 'AI విశ్లేషణ',
      sensorInputsHeading: 'సెన్సార్ డేటా',
    },
    precipitationBadge: {
      liveRadar: 'లైవ్ రాడార్',
      modelEstimate: 'మోడల్ అంచనా (ప్రత్యామ్నాయం)',
      noData: 'రాడార్ డేటా లేదు',
      lastUpdated: 'చివరి నవీకరణ',
      decodeConfidence: 'ఖచ్చితత్వం',
      stationCode: 'స్టేషన్ కోడ్',
      freshness: 'తాజాదనం',
      freshLabel: 'తాజాది (10 నిమిషాలలోపు)',
      staleLabel: 'పాతది',
      source: 'మూలం:',
    },
    waterAtlas: {
      atlasBadge: 'జల వనరుల అట్లాస్',
      coastalSyncBadge: 'తీరప్రాంత గేట్ల అనుసంధానం',
      title: 'నగర చెరువులు & అలల నియంత్రణ',
      subTitle: 'నగర చెరువుల నీటి మట్టాలు, ఆక్రమణలు మరియు సముద్ర అలల ఆధారంగా స్వయంచాలక గేట్ల నిర్వహణ.',
      highTidePeak: 'గరిష్ట అలై ఎత్తు (ముంబై పోర్ట్)',
      flapGateLockout: 'గేట్ లాకౌట్:',
      preventsBackflow: 'సముద్ర నీరు నగరం లోపలికి రాకుండా నిరోధిస్తుంది',
      urbanReservoirsHeading: 'నగర జలాశయాలు & చెరువుల సామర్థ్యం',
      totalBufferHeadroom: 'మొత్తం వరద నిల్వ సామర్థ్యం:',
      FTL: 'గరిష్ట నీటి మట్టం (FTL)',
      storage: 'ప్రస్తుత నిల్వ',
      cushion: 'మిగిలిన స్థలం',
      encroachment: 'ఆక్రమణ:',
      priority: 'ప్రాధాన్యత:',
      coastalOutfallsHeading: 'తీరప్రాంత నీటి గేట్లు & నిరోధక వ్యవస్థ',
      tidalFlapSub: 'సముద్ర నీరు వీధుల్లోకి రాకుండా పెద్ద అలల సమయంలో గేట్లు స్వయంచాలకంగా మూసుకుంటాయి.',
      dischargeRate: 'విడుదల వేగం',
      seaInvertHead: 'సముద్ర మట్టం హెడ్',
    },
    splash: {
      loadingLabel: 'SURGE ప్లాట్‌ఫారమ్ ప్రారంభమవుతోంది',
      title: 'SURGE',
      subtitle: 'పట్టణ వరద నిఘా వ్యవస్థ',
    },
    simulationTutorial: {
      bannerTitle: 'సిమ్యులేషన్ రక్షణ బ్యానర్',
      bannerText: 'ఎల్లప్పుడూ పై బ్యానర్‌ను గమనించండి - ఇది గత చారిత్రక వరద సంఘటనల రీప్లే.',
      selectorTitle: 'నగరం మరియు సంఘటన ఎంపిక',
      selectorText: 'నగరాలను (ముంబై, ఢిల్లీ, చెన్నై) మారుస్తూ 9 చారిత్రక వర్షపాత రికార్డుల నుండి ఎంచుకోండి.',
      controlsTitle: 'కాలక్రమ నియంత్రణలు',
      controlsText: 'ప్లే/పాజ్ మరియు వేగ నియంత్రణలను ఉపయోగించి వరద ప్రవాహాన్ని వీక్షించండి.',
      provenanceTitle: 'డేటా మూలం మరియు AI విశ్లేషణ',
      provenanceText: 'వాతావరణ నివేదికలు మరియు AI నిర్ణయాలను దశలవారీగా తనిఖీ చేయండి.',
      mapTitle: 'హైడ్రాలిక్ GIS మ్యాప్',
      mapText: 'మ్యాప్‌పై అంచనా వేసిన నీటి లోతు మరియు ప్రమాదకర ప్రాంతాలను చూడండి.',
      nextBtn: 'తరువాత',
      finishBtn: 'పూర్తయింది',
      skipBtn: 'దాటవేయి',
      stepOf: 'దశ',
    },
    common: {
      panelTab: 'ప్యానెల్',
      gisMapTab: 'GIS మ్యాప్',
      loadingGis: 'GIS మ్యాప్ లోడ్ అవుతోంది...',
      loadingCitizenApp: 'సిటిజన్ యాప్ లోడ్ అవుతోంది...',
      loadingOperationsHub: 'ఆపరేషన్స్ హబ్ లోడ్ అవుతోంది...',
    },
  },
};
