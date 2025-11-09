import { getDatabase, initializeDatabase } from '../db.js';
import { Database } from 'sqlite';
import { ConversationHistoryManager } from '../managers/ConversationHistoryManager.js';
import { ContextInformationManager } from '../managers/ContextInformationManager.js';
import { ReferenceKeyManager } from '../managers/ReferenceKeyManager.js';
import { KnowledgeGraphManager } from '../managers/KnowledgeGraphManager.js';
import { PlanTaskManager } from '../managers/PlanTaskManager.js';
import { SubtaskManager } from '../managers/SubtaskManager.js';

export class DatabaseService {
    private db!: Database;
    constructor() {
        // Private constructor to enforce async factory
    }

    public static async create(): Promise<DatabaseService> {
        const instance = new DatabaseService();
        await instance.init();
        return instance;
    }

    private async init() {
        this.db = await initializeDatabase();
        // Managers are now initialized and managed by MemoryManager, not DatabaseService
    }

    public getDb(): Database {
        return this.db;
    }

    /**
     * Ensures an agent exists in the database. Creates it if it doesn't exist.
     * This prevents foreign key constraint errors when using agent_id in other tables.
     */
    public async ensureAgentExists(agent_id: string): Promise<void> {
        const existing = await this.db.get(
            'SELECT agent_id FROM agents WHERE agent_id = ?',
            agent_id
        );

        if (!existing) {
            // Auto-create the agent with default values
            await this.db.run(
                `INSERT INTO agents (agent_id, name, description, creation_timestamp_unix, creation_timestamp_iso, status) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                agent_id,
                `${agent_id} Agent`,
                `Auto-created agent: ${agent_id}`,
                Math.floor(Date.now() / 1000),
                new Date().toISOString(),
                'ACTIVE'
            );
            console.log(`Auto-created agent: ${agent_id}`);
        }
    }
}
