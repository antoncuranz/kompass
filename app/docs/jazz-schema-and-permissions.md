# Jazz Schema & Permissions

This document outlines the permission structure for the Trip domain, including access levels for different user roles (Admin, Member, Guest, Worker).

```mermaid
graph TD
    %% Define Styles for Permission Scopes (Legend Colors)
    classDef scopeShared fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:black
    classDef scopeTrip fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:black
    classDef scopeTrans fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:black
    classDef scopeRestricted fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:black
    classDef scopePublic fill:#fff8e1,stroke:#fbc02d,stroke-width:2px,color:black
    classDef scopeAdmin fill:#ffebee,stroke:#c62828,stroke-width:2px,color:black
    
    %% Define style for White Subgraph Background
    classDef whiteBox fill:#ffffff,stroke:#333,stroke-width:1px

    %% --- Legend ---
    subgraph Legend
        direction TB
        L1["Public Read"]:::scopeShared
        L2["Public Write"]:::scopePublic
        L3["Members and Guests"]:::scopeTrip
        L4["Members and Workers"]:::scopeTrans
        L5["Members Only"]:::scopeRestricted
        L6["Admins Only"]:::scopeAdmin
        
        %% Force vertical stack
        L1 ~~~ L2 ~~~ L3 ~~~ L4 ~~~ L5 ~~~ L6
    end

    %% --- Nodes & Styles ---
    subgraph Structure
        direction TB
        
        STE[SharedTripEntity]:::scopeShared

        TE[TripEntity]:::scopeTrip
        Acts[Activities List]:::scopeTrip
        Accs[Accommodation List]:::scopeTrip
        ActE[ActivityEntity]:::scopeTrip
        AccE[AccommodationEntity]:::scopeTrip
        
        TE --> Acts
        TE --> Accs
        Acts --> ActE
        Accs --> AccE

        TL[Transportation List]:::scopeTrans
        TransE[TransportationEntity]:::scopeTrans
        
        TL --> TransE

        PNR[PNR List]:::scopeRestricted
        TransE -- only Flight --> PNR

        FL[Files List]:::scopeRestricted
        FileE[FileAttachmentEntity]:::scopeRestricted
        
        FL --> FileE

        JR[JoinRequests]:::scopePublic
        JRE[JoinRequestEntity]:::scopePublic
        JR --> JRE

        RS[RequestStatuses]:::scopeAdmin

        %% --- Connections ---
        STE --> TE
        STE --> JR
        STE --> RS
        
        %% Cross-Scope Links
        TE --> TL
        TE --> FL

    end

    %% Apply white background to the Structure subgraph
    class Structure whiteBox
    class Legend whiteBox
```

## Permissions for Testing

Use the following access matrix to verify permission logic in unit tests.

### Resolved Access Matrix

| Scope / Entity | Public | Guest | Member | Admin | Worker |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SharedTrip** | Read | Read | Read | Read/Write | Read |
| **Trip (General)** | - | Read/Write | Read/Write | Read/Write | - |
| **Transportation** | - | Read/Write | Read/Write | Read/Write | Read/Write |
| **PNRs (Flights)** | - | - | Read/Write | Read/Write | - |
| **Files** | - | - | Read/Write | Read/Write | - |
| **JoinRequests** | Create | Create | Create | Read/Write | Create |
| **RequestStatuses**| - | - | - | Read/Write | - |

### Key Testing Invariants

When writing schema tests, verify these invariants:

1.  **File Privacy**: `Guest` users must **never** be able to read `FileAttachmentEntity` or the `files` list.
2.  **PNR Privacy**: `Guest` users must **never** be able to read `PnrEntity` (Flight PNRs).
3.  **Worker Restrictions**: `Worker` users must **not** be able to read `TripEntity` or `PnrEntity`. They strictly access `TransportationEntity`.
4.  **Admin Supremacy**: `Admin` users must have `Read/Write` access to **all** entities.
5.  **Public Isolation**: Unauthenticated/Public users can **only** read the `SharedTripEntity` (root) and create `JoinRequestEntity` items. They must not see any internal Trip data.