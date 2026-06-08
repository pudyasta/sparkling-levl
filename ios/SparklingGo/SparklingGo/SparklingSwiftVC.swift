// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import SwiftUI
import Sparkling

class SparklingLynxElement: SPKLynxElement {
    var lynxElementName: String
    
    var lynxElementClassName: AnyClass
    
    init(lynxElementName: String, lynxElementClassName: AnyClass) {
        self.lynxElementName = lynxElementName
        self.lynxElementClassName = lynxElementClassName
    }
}


// MARK: - Back-intercept coordinator

/// Observes BackInterceptorMethod state changes and intercepts the interactive
/// pop gesture when JS has registered a back handler. When intercepted it fires
/// the `nativeBackPressed` event instead of navigating away.
private class BackInterceptCoordinator: NSObject, UIGestureRecognizerDelegate {

    weak var navigationController: UINavigationController?
    private var token: NSObjectProtocol?

    init(navigationController: UINavigationController) {
        self.navigationController = navigationController
        super.init()

        token = NotificationCenter.default.addObserver(
            forName: .backInterceptorStateChanged,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            let enabled = notification.userInfo?["enabled"] as? Bool ?? false
            self?.setInterceptEnabled(enabled)
        }
    }

    deinit {
        if let token { NotificationCenter.default.removeObserver(token) }
    }

    private func setInterceptEnabled(_ enabled: Bool) {
        navigationController?.interactivePopGestureRecognizer?.isEnabled = !enabled
        if enabled {
            navigationController?.interactivePopGestureRecognizer?.delegate = self
        }
    }

    // UIGestureRecognizerDelegate — called when the swipe-from-left begins
    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        if BackInterceptorMethod.isInterceptEnabled {
            // Fire the JS event and swallow the gesture
            BackInterceptorMethod.dispatchNativeBackEvent()
            return false
        }
        return true
    }
}

// MARK: - SPKSwiftVC

struct SPKSwiftVC: UIViewControllerRepresentable {
    @State private var state_frame: CGRect
    
    init(state_frame: CGRect = .zero) {
        self.state_frame = state_frame
    }
    
    func makeUIViewController(context: Context) -> some UIViewController {
        let url = "hybrid://lynxview?bundle=main.lynx.bundle&hide_status_bar=0&hide_nav_bar=1"
        let spkContext = SPKContext()
        let elements: [SparklingLynxElement] = [
            SparklingLynxElement(lynxElementName: "input",        lynxElementClassName: LynxInput.self),
            SparklingLynxElement(lynxElementName: "native-svg",   lynxElementClassName: NativeSVGView.self),
            SparklingLynxElement(lynxElementName: "video-player", lynxElementClassName: VideoPlayerView.self),
        ]
        spkContext.customUIElements = elements
        
        let vc = SPKRouter.create(withURL: url, context: spkContext, frame: self.state_frame)
        let naviVC = UINavigationController(rootViewController: vc)
        
        let coordinator = BackInterceptCoordinator(navigationController: naviVC)
        objc_setAssociatedObject(naviVC, &AssociatedKeys.coordinator, coordinator, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        return naviVC
    }
    
    func updateUIViewController(_ uiViewController: UIViewControllerType, context: Context) {

    }
}

private enum AssociatedKeys {
    static var coordinator = "BackInterceptCoordinator"
}


struct DemoVC: View {
    var body: some View {
        GeometryReader { geometry in
            SPKSwiftVC(state_frame: geometry.frame(in: .local))
        }
        .ignoresSafeArea(.all, edges: [.bottom, .leading, .trailing])
        .foregroundStyle(.clear)
        .padding(.top, 0.2)
    }
}
