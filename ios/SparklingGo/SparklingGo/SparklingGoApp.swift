// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import SwiftUI
import Lynx
import Sparkling
import Sparkling_Router
import SDWebImage
import SDWebImageWebPCoder
import SparklingMethod
import DebugRouter
import LynxService

class AppDelegate: NSObject, UIApplicationDelegate {
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        let webPCoder = SDImageWebPCoder.shared
        SDImageCodersManager.shared.addCoder(webPCoder)

        DebugRouter().enableAllSessions()

        
        SPKServiceRegister.registerAll()
        SPKExecuteAllPrepareBootTask()
        SPKKit.DIContainer.register(SPKResourceLoaderProtocol.self, scope: .transient) {
            HTTPSResourceLoaderImpl()
        }
        SPKKit.DIContainer.register(SPKTrackerService.self, scope: ServiceScope.transient) {
            SparklingGoTrackerService()
        }
        return true
    }
}

@main
struct SparklingGoApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    var body: some Scene {
        WindowGroup {
            DemoVC()
                .onOpenURL { url in
                    Self.handleDeepLink(url)
                }
        }
    }

    // MARK: - Deep link: levl://verify?userId=...&email=...&uuid=...&token=...

    private static func handleDeepLink(_ url: URL) {
        guard url.scheme == "levl", url.host == "verify" else { return }

        let queryItems = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems ?? []
        let params = queryItems.reduce(into: [String: String]()) { $0[$1.name] = $1.value ?? "" }

        let userId = params["userId"] ?? ""
        let email  = params["email"]  ?? ""
        let uuid   = params["uuid"]   ?? ""
        let token  = params["token"]  ?? ""

        DeepLinkHolder.shared.set(userId: userId, email: email, uuid: uuid, token: token)

        var components = URLComponents()
        components.scheme = "hybrid"
        components.host = "lynxview_page"
        components.queryItems = [
            URLQueryItem(name: "bundle",             value: "verify.lynx.bundle"),
            URLQueryItem(name: "hide_nav_bar",        value: "1"),
            URLQueryItem(name: "screen_orientation",  value: "portrait"),
            URLQueryItem(name: "userId",              value: userId),
            URLQueryItem(name: "email",               value: email),
            URLQueryItem(name: "uuid",                value: uuid),
            URLQueryItem(name: "token",               value: token),
        ]

        guard let sparklingURL = components.url?.absoluteString else { return }

        let context = SPKContext()
        context.customUIElements = [
            SparklingLynxElement(lynxElementName: "input",        lynxElementClassName: LynxInput.self),
            SparklingLynxElement(lynxElementName: "native-svg",   lynxElementClassName: NativeSVGView.self),
            SparklingLynxElement(lynxElementName: "video-player", lynxElementClassName: VideoPlayerView.self),
        ]

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            SPKRouter.open(withURL: sparklingURL, context: context)
        }
    }
}
