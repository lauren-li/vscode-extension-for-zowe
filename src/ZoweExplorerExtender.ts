/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

import * as PromiseQueue from "promise-queue";
import { IProfileLoaded } from "@zowe/imperative";
import { IZoweTreeNode, IZoweDatasetTreeNode, IZoweUSSTreeNode, IZoweJobTreeNode } from "./api/IZoweTreeNode";
import { ZoweExplorerApi } from "./api/ZoweExplorerApi";
import { Profiles } from "./Profiles";
import { getProfile, getLinkedProfile } from "./utils/profileLink";
import { IZoweTree } from "./api/IZoweTree";

/**
 * The Zowe Explorer API Register singleton that gets exposed to other VS Code
 * extensions to contribute their implementations.
 * @export
 */
export class ZoweExplorerExtender implements ZoweExplorerApi.IApiExplorerExtender {
    public static ZoweExplorerExtenderInst: ZoweExplorerExtender;

    /**
     * Access the singleton instance.
     * @static
     * @returns {ZoweExplorerExtender} the ZoweExplorerExtender singleton instance
     */
    public static createInstance(
      datasetProvider?: IZoweTree<IZoweDatasetTreeNode>,
      ussFileProvider?: IZoweTree<IZoweUSSTreeNode>,
      jobsProvider?: IZoweTree<IZoweJobTreeNode>
    ): ZoweExplorerExtender {
        const ZoweExplorerExtenderInst = ZoweExplorerExtender.instance;
        ZoweExplorerExtenderInst.datasetProvider = datasetProvider;
        ZoweExplorerExtenderInst.ussFileProvider = ussFileProvider;
        ZoweExplorerExtenderInst.jobsProvider = jobsProvider;
        return ZoweExplorerExtenderInst;
    }

    public static getInstance(
        datasetProvider?: IZoweTree<IZoweDatasetTreeNode>,
        ussFileProvider?: IZoweTree<IZoweUSSTreeNode>,
        jobsProvider?: IZoweTree<IZoweJobTreeNode>
      ): ZoweExplorerExtender {
        if (datasetProvider || ussFileProvider || jobsProvider || !this.ZoweExplorerExtenderInst) {
            return this.createInstance(datasetProvider, ussFileProvider, jobsProvider);
          }
        return this.ZoweExplorerExtenderInst;
      }

   // Queue of promises to process sequentially when multiple extension register in parallel
    private static refreshProfilesQueue = new PromiseQueue(1, Infinity);
    /**
     * This object represents a collection of the APIs that get exposed to other VS Code
     * extensions that want to contribute alternative implementations such as alternative ways
     * of retrieving files and data from z/OS.
     */
    private static instance: ZoweExplorerExtender = new ZoweExplorerExtender();
   // not all extenders will need to refresh trees
    public datasetProvider: IZoweTree<IZoweDatasetTreeNode>;
    public ussFileProvider: IZoweTree<IZoweUSSTreeNode>;
    public jobsProvider: IZoweTree<IZoweJobTreeNode>;
    public ZoweExplorerExtenderInst: ZoweExplorerExtender;


    /**
     * This method can be used by other VS Code Extensions to access the primary profile.
     *
     * @param primaryNode represents the Tree item that is being used
     * @return The requested profile
     *
     */
    public getProfile(primaryNode: IZoweTreeNode): IProfileLoaded  {
        return getProfile(primaryNode);
    }

    /**
     * This method can be used by other VS Code Extensions to access an alternative
     * profile types that can be employed in conjunction with the primary profile to provide
     * alternative support.
     *
     * @param primaryNode represents the Tree item that is being used
     * @return The requested profile
     */
    public getLinkedProfile(primaryNode: IZoweTreeNode, type: string): Promise<IProfileLoaded> {
        return getLinkedProfile(primaryNode, type);
    }

    /**
     * After an extenders registered all its API extensions it
     * might want to request that profiles should get reloaded
     * to make them automatically appears in the Explorer drop-
     * down dialogs.
     *
     * @param profileType optional profile type that the extender can specify
     */
    public async reloadProfiles(profileType?: string): Promise<void> {
        // sequentially reload the internal profiles cache to satisfy all the newly added profile types
        await ZoweExplorerExtender.refreshProfilesQueue.add( () => Profiles.getInstance().refresh());
        const profilesForType = Profiles.getInstance().getProfiles("rse"); // TO-DO
        this.datasetProvider?.addSession(); // TO-DO add profileType param to load non-zosmf default profiles
        this.ussFileProvider?.addSession(); // TO-DO add profileType param to load non-zosmf default profiles
        this.jobsProvider?.addSession(); // TO-DO add profileType param to load non-zosmf default profiles
    }
}
