// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ClaimRegistry {
    struct Claim {
        bytes32 contentHash; 
        string ipfsCid;  
        uint256 timestamp;    // block timestamp when stored
        address submitter;    // who added/updated
        bool exists;          // marker
    }

    mapping(bytes32 => Claim) private claims;

    event ClaimAdded(bytes32 indexed contentHash, string ipfsCid, address indexed submitter);
    event ClaimUpdated(bytes32 indexed contentHash, string ipfsCid, address indexed submitter);

    function addOrUpdateClaim(bytes32 _contentHash, string calldata _ipfsCid) external {
        Claim storage c = claims[_contentHash];

        if (c.exists) {
            // Update
            c.ipfsCid = _ipfsCid;
            c.timestamp = block.timestamp;
            c.submitter = msg.sender;
            emit ClaimUpdated(_contentHash, _ipfsCid, msg.sender);
        } else {
            // New
            claims[_contentHash] = Claim({
                contentHash: _contentHash,
                ipfsCid: _ipfsCid,
                timestamp: block.timestamp,
                submitter: msg.sender,
                exists: true
            });
            emit ClaimAdded(_contentHash, _ipfsCid, msg.sender);
        }
    }

    function getClaim(bytes32 _contentHash)
        external
        view
        returns (Claim memory)
    {
        return claims[_contentHash];
    }

    function claimExists(bytes32 _contentHash) external view returns (bool) {
        return claims[_contentHash].exists;
    }
}
